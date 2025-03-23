import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import EndpointList from '../endpoints/EndpointList';
import EndpointForm from '../endpoints/EndpointForm';
import { projectsApi } from '../../utils/api';
import { Project, ProjectData } from '../../types/project';
import { useTheme } from '../../contexts/ThemeContext';

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
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [isValidJson, setIsValidJson] = useState(true);
  const { theme } = useTheme();

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
      await projectsApi.deleteProject(id);
      toast.success('Project deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 divide-y divide-[var(--border-color)]">
        <div className="space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-[var(--text-primary)]">Project Settings</h3>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
              Configure your project settings and manage API keys
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[var(--text-primary)] sm:mt-px sm:pt-2"
              >
                Project Name
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  defaultValue={formData.name}
                  onChange={handleChange}
                  className="max-w-lg block w-full shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:max-w-xs sm:text-sm border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-[var(--text-primary)] sm:mt-px sm:pt-2"
              >
                Description
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={formData.description}
                  onChange={handleChange}
                  className="max-w-lg shadow-sm block w-full focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label
                htmlFor="defaultSchema"
                className="block text-sm font-medium text-[var(--text-primary)] sm:mt-px sm:pt-2"
              >
                Default Schema
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <CodeMirror
                  value={formData.defaultSchema}
                  height="200px"
                  extensions={[json()]}
                  onChange={handleJsonChange}
                  className={`border rounded-md ${!isValidJson ? 'border-[var(--error-border)]' : 'border-[var(--input-border)]'}`}
                  theme={theme}
                />
                {!isValidJson && (
                  <p className="mt-2 text-sm text-[var(--error-text)]">Invalid JSON format</p>
                )}
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label
                htmlFor="defaultCount"
                className="block text-sm font-medium text-[var(--text-primary)] sm:mt-px sm:pt-2"
              >
                Default Count
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  type="number"
                  name="defaultCount"
                  id="defaultCount"
                  defaultValue={formData.defaultCount}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="max-w-lg block w-full shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:max-w-xs sm:text-sm border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-md"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
              <label
                htmlFor="requireAuth"
                className="block text-sm font-medium text-[var(--text-primary)] sm:mt-px sm:pt-2"
              >
                Authentication
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="requireAuth"
                    id="requireAuth"
                    defaultChecked={formData.requireAuth}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-[var(--accent-color)] focus:ring-[var(--accent-color)] border-[var(--input-border)] rounded"
                  />
                  <label htmlFor="requireAuth" className="ml-2 block text-sm text-[var(--text-primary)]">
                    Require API Key Authentication
                  </label>
                </div>
              </div>
            </div>

            {formData.requireAuth && (
              <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
                <label
                  htmlFor="apiKeys"
                  className="block text-sm font-medium text-[var(--text-primary)] sm:mt-px sm:pt-2"
                >
                  API Keys
                </label>
                <div className="mt-1 sm:mt-0 sm:col-span-2 space-y-2">
                  {formData.apiKeys.map((key, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        defaultValue={key}
                        onChange={(e) => handleApiKeyChange(index, e.target.value)}
                        className="max-w-lg block w-full shadow-sm focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-md"
                        placeholder="Enter API key"
                      />
                      <button
                        type="button"
                        onClick={() => removeApiKey(index)}
                        className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-[var(--error-bg)] hover:bg-[var(--error-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--error-border)]"
                      >
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addApiKey}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
                  >
                    Add API Key
                  </button>
                </div>
              </div>
            )}

            <div className="pt-5">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--error-bg)] hover:bg-[var(--error-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--error-border)]"
                >
                  Delete Project
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>

        {id && (
          <div className="pt-8">
            <EndpointList projectId={id} />
          </div>
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
