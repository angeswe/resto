import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Switch,
  Tabs,
  Tab
} from '@heroui/react';
import EndpointList from '../endpoints/EndpointList';
import { projectsApi } from '../../utils/api';
import { ProjectData } from '../../types/project';
import { useAppContext } from '../../contexts/AppContext';
import ApiKeyManager from './ApiKeyManager';
import SchemaEditor from './SchemaEditor';
import ProjectDangerZone from './ProjectDangerZone';

interface FormData {
  name: string;
  description: string;
  defaultSchema: string;
  defaultCount: string;
  requireAuth: boolean;
  apiKeys: string[];
}

const defaultJsonSchema = {
  id: "(random:uuid)",
  name: "(random:name)",
  email: "(random:email)",
  createdAt: "(random:datetime)"
};

const ProjectSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, deleteProject } = useAppContext();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    defaultSchema: JSON.stringify(defaultJsonSchema, null, 2),
    defaultCount: '10',
    requireAuth: false,
    apiKeys: ['']
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          toast.error('Project ID is required');
          navigate('/');
          return;
        }

        const data = await projectsApi.getProject(id);
        if (!data) {
          toast.error('Failed to load project');
          navigate('/');
          return;
        }

        const formattedData = {
          name: data.name || '',
          description: data.description || '',
          defaultSchema: typeof data.defaultSchema === 'object'
            ? JSON.stringify(data.defaultSchema, null, 2)
            : JSON.stringify(defaultJsonSchema, null, 2),
          defaultCount: (data.defaultCount || 10).toString(),
          requireAuth: data.requireAuth || false,
          apiKeys: data.apiKeys?.length ? data.apiKeys : ['']
        };

        setFormData(formattedData);
        setOriginalData(formattedData);
      } catch (error) {
        console.error('Error fetching project:', error);
        toast.error('Failed to load project');
        navigate('/');
      }
    };

    fetchProject();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleJsonChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      defaultSchema: value
    }));

    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleApiKeyChange = (index: number, value: string) => {
    setFormData(prev => {
      const newApiKeys = [...prev.apiKeys];
      newApiKeys[index] = value;
      return { ...prev, apiKeys: newApiKeys };
    });
  };

  const addApiKey = () => {
    setFormData(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, '']
    }));
  };

  const removeApiKey = (index: number) => {
    setFormData(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter((_, i) => i !== index)
    }));
  };

  const hasUnsavedChanges = () => {
    if (!originalData) return false;
    return (
      originalData.name !== formData.name ||
      originalData.description !== formData.description ||
      originalData.defaultSchema !== formData.defaultSchema ||
      originalData.defaultCount !== formData.defaultCount ||
      originalData.requireAuth !== formData.requireAuth ||
      JSON.stringify(originalData.apiKeys) !== JSON.stringify(formData.apiKeys)
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    try {
      let defaultSchemaObj;
      try {
        defaultSchemaObj = JSON.parse(formData.defaultSchema);
      } catch (error) {
        toast.error('Invalid JSON schema');
        return;
      }

      const projectData: ProjectData = {
        name: formData.name,
        description: formData.description,
        defaultSchema: defaultSchemaObj,
        defaultCount: parseInt(formData.defaultCount, 10),
        requireAuth: formData.requireAuth,
        apiKeys: formData.apiKeys.filter(key => key.trim() !== '')
      };

      await projectsApi.updateProject(id, projectData);
      toast.success('Project settings updated');
      setOriginalData(formData);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      if (!id) return;
      await deleteProject(id);
      toast.success('Project deleted');
      navigate('/');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs fullWidth>
        <Tab title="Project">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-end">
              <Button
                type="submit"
                isDisabled={!hasUnsavedChanges()}
              >
                Save Changes
              </Button>
            </div>
            <Card>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <SchemaEditor
                  value={formData.defaultSchema}
                  onChange={handleJsonChange}
                  isValid={isValidJson}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                />

                <div>
                  <label className="block text-sm font-medium mb-1">Default Count</label>
                  <Input
                    type="number"
                    name="defaultCount"
                    value={formData.defaultCount}
                    onChange={handleChange}
                    min={1}
                    max={100}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Require Authentication</label>
                    <p className="text-sm text-gray-500">
                      Enable API key authentication for all endpoints
                    </p>
                  </div>
                  <Switch
                    name="requireAuth"
                    checked={formData.requireAuth}
                    onChange={handleCheckboxChange}
                  />
                </div>

                {formData.requireAuth && (
                  <ApiKeyManager
                    apiKeys={formData.apiKeys}
                    onApiKeyChange={handleApiKeyChange}
                    onAddApiKey={addApiKey}
                    onRemoveApiKey={removeApiKey}
                  />
                )}
              </CardBody>
            </Card>
            <ProjectDangerZone className="rounded-none" onDelete={handleDelete} />
          </form>
        </Tab>
        <Tab title="Endpoints">
          <Card>
            <CardBody>
              <EndpointList projectId={id!} />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProjectSettings;
