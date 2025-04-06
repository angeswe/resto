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
import { ProjectData } from '../../types/project';
import { useAppContext } from '../../contexts/AppContextWithTanstack';
import { useTabContext } from '../../contexts/TabContext';
import ApiKeyManager from './ApiKeyManager';
import SchemaEditor from './SchemaEditor';
import ProjectDangerZone from './ProjectDangerZone';
import { useProject, useUpdateProject, useDeleteProject } from '../../hooks/queries/useProjectQueries';
import { DEFAULT_SCHEMA } from '../../types/schema';
import { DeleteIcon, EndpointIcon, SettingsIcon } from '../common/Icons';

/**
 * Form data interface for project settings
 */
interface FormData {
  name: string;
  description: string;
  defaultSchema: string;
  defaultCount: string;
  requireAuth: boolean;
  apiKeys: string[];
}

/**
 * Component for managing project settings, endpoints, and danger zone actions
 */
const ProjectSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useAppContext();
  const { activeTab, setActiveTab } = useTabContext();

  // TanStack Query hooks
  const {
    data: project,
    isLoading,
    isError,
    error
  } = useProject(id || '');

  const updateProjectMutation = useUpdateProject(id || '');
  const deleteProjectMutation = useDeleteProject();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    defaultSchema: JSON.stringify(DEFAULT_SCHEMA, null, 2),
    defaultCount: '10',
    requireAuth: false,
    apiKeys: ['']
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [isValidJson, setIsValidJson] = useState(true);

  // Initialize form data when project is loaded
  useEffect(() => {
    if (project) {
      // If schema is an object, convert to string for display
      // If it's already a string, use it directly
      const schemaValue = typeof project.defaultSchema === 'object'
        ? JSON.stringify(project.defaultSchema, null, 2)
        : typeof project.defaultSchema === 'string'
          ? project.defaultSchema
          : JSON.stringify(DEFAULT_SCHEMA, null, 2);

      const formattedData = {
        name: project.name || '',
        description: project.description || '',
        defaultSchema: schemaValue,
        defaultCount: (project.defaultCount || 10).toString(),
        requireAuth: project.requireAuth || false,
        apiKeys: project.apiKeys?.length ? project.apiKeys : ['']
      };

      setFormData(formattedData);
      setOriginalData(formattedData);
    }
  }, [project]);

  // Handle loading and error states
  if (isLoading) {
    return <div className="p-6 text-center">Loading project settings...</div>;
  }

  if (isError || !id) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load project';
    toast.error(errorMessage);
    navigate('/');
    return null;
  }

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;

    try {
      // Parse the schema string to an object
      let schemaObj;
      try {
        schemaObj = JSON.parse(formData.defaultSchema);
      } catch (error) {
        toast.error('Invalid JSON schema');
        return;
      }

      const projectData: ProjectData = {
        name: formData.name,
        description: formData.description,
        defaultSchema: schemaObj,
        defaultCount: parseInt(formData.defaultCount, 10),
        requireAuth: formData.requireAuth,
        apiKeys: formData.apiKeys.filter(key => key.trim() !== '')
      };

      await updateProjectMutation.mutateAsync(projectData);
      setOriginalData(formData);
      toast.success('Project updated successfully');
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
      await deleteProjectMutation.mutateAsync(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs fullWidth selectedKey={activeTab as string} onSelectionChange={setActiveTab}>
        <Tab key="settings" title={
          <div className="flex items-center space-x-2">
            <SettingsIcon />
            <span>Settings</span>
          </div>
        }>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    isSelected={formData.requireAuth}
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
            <div className="flex justify-end">
              <Button
                type="submit"
                isDisabled={!hasUnsavedChanges() || updateProjectMutation.isPending}
                isLoading={updateProjectMutation.isPending}
              >
                {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Tab>

        <Tab key="endpoints" title={<div className="flex items-center space-x-2"><EndpointIcon /><span>Endpoints</span></div>}>
          <Card>
            <CardBody>
              <EndpointList projectId={id!} />
            </CardBody>
          </Card>
        </Tab>

        <Tab key="danger" title={<div className="flex items-center space-x-2"><DeleteIcon /><span>Danger Zone</span></div>}>
          <ProjectDangerZone
            onDelete={handleDelete}
            isDeleting={deleteProjectMutation.isPending}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProjectSettings;
