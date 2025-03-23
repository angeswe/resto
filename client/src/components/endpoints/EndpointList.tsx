import React, { useEffect, useState } from 'react';
import { Endpoint } from '../../types/project';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import EndpointForm from './EndpointForm';
import { endpointsApi } from '../../utils/api';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Response">
      <div className="space-y-4">
        {error ? (
          <div className="text-red-600 whitespace-pre-wrap">{error}</div>
        ) : (
          <CodeMirror
            value={JSON.stringify(response, null, 2)}
            height="400px"
            extensions={[json()]}
            editable={false}
          />
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Endpoints</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Endpoint
        </button>
      </div>

      {endpoints.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--text-secondary)]">No endpoints found. Click "Add Endpoint" to create one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="bg-white dark:bg-gray-800 p-4 rounded shadow-md"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`inline-block px-2 py-1 text-sm rounded mr-2 ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">{endpoint.path}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestEndpoint(endpoint)}
                    className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleEditClick(endpoint)}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(endpoint)}
                    className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Delete
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
