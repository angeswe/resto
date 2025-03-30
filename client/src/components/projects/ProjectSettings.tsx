import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import {
  Card,
  CardBody,
  Input,
  Textarea,
  Button,
  Switch,
  Divider
} from '@heroui/react';
import { TrashIcon } from "@heroicons/react/24/outline";
import EndpointList from '../endpoints/EndpointList';
import EndpointForm from '../endpoints/EndpointForm';
import { projectsApi } from '../../utils/api';
import { ProjectData } from '../../types/project';
import { useAppContext } from '../../contexts/AppContext';

interface FormData {
  name: string;
  description: string;
  defaultSchema: string;
  defaultCount: number;
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
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    defaultSchema: JSON.stringify(defaultJsonSchema, null, 2),
    defaultCount: 10,
    requireAuth: false,
    apiKeys: ['']
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [isValidJson, setIsValidJson] = useState(true);
  const { deleteProject } = useAppContext();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!id) {
          console.error('No project ID in URL');
          toast.error('Project ID is required');
          navigate('/');
          return;
        }

        console.log('Fetching project with ID:', id);
        const data = await projectsApi.getProject(id);
        console.log('Received project data:', data);

        if (!data) {
          console.error('No project data received');
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
          defaultCount: data.defaultCount || 10,
          requireAuth: data.requireAuth || false,
          apiKeys: data.apiKeys?.length ? data.apiKeys : ['']
        };

        console.log('Setting form data:', formattedData);
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
    console.log(`Handling change for ${name}:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleJsonChange = (value: string) => {
    console.log('Handling JSON change:', value);
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
        defaultCount: formData.defaultCount,
        requireAuth: formData.requireAuth,
        apiKeys: formData.apiKeys.filter(key => key.trim() !== '')
      };

      await projectsApi.updateProject(id, projectData);
      toast.success('Project settings updated');
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
      toast.success('Project deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h3 className="text-lg font-medium text-[var(--text-primary)]">Project Settings</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Configure your project settings and manage API keys
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  type="text"
                  name="name"
                  label="Project Name"
                  value={formData.name}
                  onChange={handleChange}
                  isRequired
                />

                <Textarea
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your project..."
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Default Schema
                  </label>
                  <CodeMirror
                    value={formData.defaultSchema}
                    height="200px"
                    extensions={[json()]}
                    onChange={handleJsonChange}
                    className={`border rounded-md ${!isValidJson ? 'border-[var(--error-border)]' : 'border-[var(--input-border)]'}`}
                  />
                  {!isValidJson && (
                    <p className="mt-2 text-sm text-[var(--error-text)]">Invalid JSON format</p>
                  )}
                </div>

                <Input
                  type="number"
                  name="defaultCount"
                  label="Default Count"
                  value={formData.defaultCount.toString()}
                  onChange={handleChange}
                  min={1}
                  max={100}
                />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Authentication</h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Enable authentication for this project's endpoints
                    </p>
                  </div>
                  <Switch
                    name="requireAuth"
                    checked={formData.requireAuth}
                    onChange={handleCheckboxChange}
                  />
                </div>

                <Divider />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium">API Keys</h4>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={addApiKey}
                    >
                      Add Key
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.apiKeys.map((key, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={key}
                          onChange={(e) => handleApiKeyChange(index, e.target.value)}
                          placeholder="Enter API key"
                          className="flex-1"
                        />
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          onPress={() => removeApiKey(index)}
                          disabled={formData.apiKeys.length === 1}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6">
                <Button
                  color="danger"
                  variant="solid"
                  onPress={handleDelete}
                  startContent={<TrashIcon className="h-5 w-5" />}
                >
                  Delete Project
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    color="primary"
                    variant="solid"
                    isDisabled={!isValidJson || !hasUnsavedChanges()}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
        {id && (
          <Card>
            <CardBody>
              <EndpointList projectId={id} />
            </CardBody>
          </Card>
        )}

        {showEndpointModal && id && (
          <EndpointForm
            projectId={id}
            onClose={() => setShowEndpointModal(false)}
            onSuccess={() => {
              setShowEndpointModal(false);
              // Refresh endpoints list
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectSettings;
