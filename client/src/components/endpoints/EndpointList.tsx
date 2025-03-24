import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Endpoint } from '../../types/project';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import EndpointForm from './EndpointForm';
import { endpointsApi } from '../../utils/api';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useTheme } from '../../contexts/ThemeContext';

interface EndpointListProps {
  projectId: string;
}

interface TestResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  response: any;
  error?: string;
}

const TestResponseModal: React.FC<TestResponseModalProps> = ({ isOpen, onClose, response, error }) => {
  const { theme } = useTheme();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Response">
      <div className="space-y-4">
        {error ? (
          <div className="text-red-600 whitespace-pre-wrap">{error}</div>
        ) : (
          <div className="overflow-hidden border border-[var(--border-color)] rounded-lg">
            <CodeMirror
              value={JSON.stringify(response, null, 2)}
              height="400px"
              extensions={[json()]}
              editable={false}
              theme={theme === 'dark' ? 'dark' : 'light'}
              className="!bg-[var(--bg-secondary)]"
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

const EndpointList: React.FC<EndpointListProps> = ({ projectId }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string>('');

  const fetchEndpoints = async () => {
    try {
      const fetchedEndpoints = await endpointsApi.getEndpoints(projectId);
      console.log('Fetched endpoints:', fetchedEndpoints);
      setEndpoints(fetchedEndpoints);
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
      toast.error('Failed to fetch endpoints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, [projectId]);

  const handleEndpointSuccess = async () => {
    await fetchEndpoints();
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleEditClick = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setShowEditModal(true);
  };

  const handleTestEndpoint = async (endpoint: Endpoint) => {
    try {
      setTestError('');
      setTestResponse(null);
      setShowTestModal(true);

      // Use the same backend URL as the rest of the application
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // The path after projectId is completely user-defined from settings
      let url = `${baseUrl}/mock/${projectId}${endpoint.path}/${endpoint.parameterPath}`;
      
      if (endpoint.method === 'GET' && endpoint.responseType === 'single') {
        // For single item endpoints, append a test ID
        url = url.replace(`${endpoint.parameterPath}`, '123');
      }

      console.log('Testing endpoint:', { 
        url, 
        method: endpoint.method, 
        path: endpoint.path,
        endpoint
      });

      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(endpoint.requireAuth && endpoint.apiKeys.length > 0
            ? { 'X-API-Key': endpoint.apiKeys[0] }
            : {})
        },
        ...(endpoint.method !== 'GET' && {
          body: JSON.stringify(endpoint.schemaDefinition)
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON. Response type: ' + contentType);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      console.log('Test response:', data);
      setTestResponse(data.data || data);
    } catch (error) {
      console.error('Test request failed:', error);
      setTestError(error instanceof Error ? error.message : 'Failed to test endpoint');
      toast.error('Test request failed. Please check the console for details.');
    }
  };

  const handleDelete = async (endpoint: Endpoint) => {
    if (!window.confirm('Are you sure you want to delete this endpoint?')) {
      return;
    }

    try {
      await endpointsApi.deleteEndpoint(endpoint.id);
      toast.success('Endpoint deleted successfully');
      await fetchEndpoints();
    } catch (error) {
      console.error('Failed to delete endpoint:', error);
      toast.error('Failed to delete endpoint');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl sm:text-xl font-semibold text-[var(--text-primary)]">Endpoints</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Create and manage your API endpoints
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to={`/projects/${projectId}/endpoints/new`}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]"
          >
            <svg 
              className="mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                clipRule="evenodd" 
              />
            </svg>
            Create Endpoint
          </Link>
        </div>
      </div>

      {endpoints.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--text-secondary)]">No endpoints found. Click "Create Endpoint" to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <Link
                  to={`/projects/${projectId}/endpoints/${endpoint.id}`}
                  className="text-lg font-medium text-[var(--text-primary)] hover:text-[var(--text-primary-hover)] cursor-pointer"
                >
                  <span className={`inline-block px-2 py-1 text-sm rounded mr-2 ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {endpoint.method}
                  </span>
                  {endpoint.path}
                </Link>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestEndpoint(endpoint)}
                    className="inline-flex items-center p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-secondary)] transition-colors duration-200"
                    title="Test endpoint"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEditClick(endpoint)}
                    className="inline-flex items-center p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-secondary)] transition-colors duration-200"
                    title="Edit endpoint"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(endpoint)}
                    className="inline-flex items-center p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--delete-hover)] hover:bg-[var(--bg-secondary)] transition-colors duration-200"
                    title="Delete endpoint"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div>Response Type: {endpoint.responseType}</div>
                {endpoint.responseType === 'list' && (
                  <div>Count: {endpoint.count}</div>
                )}
                {endpoint.requireAuth && (
                  <div>Authentication Required</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Endpoint">
        <EndpointForm 
          projectId={projectId} 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleEndpointSuccess}
        />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Endpoint">
        {selectedEndpoint && (
          <EndpointForm
            projectId={projectId}
            endpoint={selectedEndpoint}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEndpointSuccess}
          />
        )}
      </Modal>

      <TestResponseModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        response={testResponse}
        error={testError}
      />
    </div>
  );
};

export default EndpointList;
