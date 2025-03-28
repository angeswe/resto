import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Endpoint } from '../../types/project';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import EndpointForm from './EndpointForm';
import EndpointTester from './EndpointTester';
import EndpointCard from './EndpointCard';
import { endpointsApi } from '../../utils/api';

interface EndpointListProps {
  projectId: string;
}

const EndpointList: React.FC<EndpointListProps> = ({ projectId }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);

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

  const handleTestClick = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setShowTestModal(true);
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
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              projectId={projectId}
              onTest={handleTestClick}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {(showCreateModal || (showEditModal && selectedEndpoint)) && (
        <Modal isOpen={showCreateModal || showEditModal} onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedEndpoint(null);
        }} title={showCreateModal ? "Create Endpoint" : "Edit Endpoint"}>
          <EndpointForm
            onClose={() => {
              setShowCreateModal(false);
              setShowEditModal(false);
              setSelectedEndpoint(null);
            }}
            onSuccess={handleEndpointSuccess}
            projectId={projectId}
            endpoint={selectedEndpoint || undefined}
          />
        </Modal>
      )}

      {showTestModal && selectedEndpoint && (
        <EndpointTester
          isOpen={showTestModal}
          onClose={() => {
            setShowTestModal(false);
            setSelectedEndpoint(null);
          }}
          endpoint={selectedEndpoint}
          projectId={projectId}
        />
      )}
    </div>
  );
};

export default EndpointList;
