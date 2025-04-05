import React, { useState, useEffect } from 'react';
import { Endpoint, Project, EndpointMethod, ResponseType } from '../../types/project';
import { toast } from 'react-toastify';
import EndpointTester from './EndpointTester';
import EndpointCard from './EndpointCard';
import { endpointsApi, projectsApi } from '../../utils/api';
import EndpointModal from './EndpointModal';
import { Button, Card, CardBody, Link } from '@heroui/react';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

interface EndpointListProps {
  projectId: string;
}

const EndpointList: React.FC<EndpointListProps> = ({ projectId }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const data = await endpointsApi.getEndpoints(projectId);
      // Parse schemaDefinition for each endpoint
      const parsedEndpoints = data.map(endpoint => ({
        ...endpoint,
        schemaDefinition: typeof endpoint.schemaDefinition === 'string'
          ? JSON.parse(endpoint.schemaDefinition)
          : endpoint.schemaDefinition
      }));
      setEndpoints(parsedEndpoints);
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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await projectsApi.getProject(projectId);
        setProject({
          ...data,
          defaultSchema: typeof data.defaultSchema === 'string'
            ? JSON.parse(data.defaultSchema)
            : data.defaultSchema
        });
      } catch (error) {
        console.error('Failed to fetch project:', error);
      }
    };
    fetchProject();
  }, [projectId]);

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
      await fetchEndpoints();
    } catch (error) {
      console.error('Failed to delete endpoint:', error);
    }
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Endpoints</h2>
        <Button
          onPress={handleCreateClick}
        >
          Create New Endpoint
        </Button>
      </div>

      {endpoints.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardBody className="flex flex-col items-center justify-center py-12">
            <FolderIcon className="h-12 w-12 text-default-400" />
            <h3 className="mt-2 text-sm font-medium">No endpoints</h3>
            <p className="mt-1 text-sm text-default-500">
              Get started by creating a new endpoint.
            </p>
            <div className="mt-6">
              <Button
                onPress={handleCreateClick}
                color="primary"
                variant="solid"
                className="bg-primary-600 text-white hover:bg-primary-700"
                startContent={<PlusIcon className="h-5 w-5" />}
              >
                Create Endpoint
              </Button>
            </div>
          </CardBody>
        </Card>
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

      {showCreateModal && (
        <EndpointModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          projectId={projectId}
          onUpdate={fetchEndpoints}
          initialData={{
            requireAuth: project?.requireAuth || false,
            path: '',
            method: 'GET' as EndpointMethod,
            schemaDefinition: project?.defaultSchema || '',
            count: 10,
            supportPagination: true,
            apiKeys: [],
            delay: 0,
            responseType: 'list' as ResponseType,
            parameterPath: '',
            responseHttpStatus: '200'
          }}
        />
      )}

      {showEditModal && selectedEndpoint && (
        <EndpointModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEndpoint(null);
          }}
          projectId={projectId}
          onUpdate={fetchEndpoints}
          initialData={selectedEndpoint}
        />
      )}
    </div>
  );
};

export default EndpointList;
