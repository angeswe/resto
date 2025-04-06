import React, { useState } from 'react';
import { Endpoint, EndpointMethod, ResponseType } from '../../types/project';
import EndpointTester from './EndpointTester';
import EndpointCard from './EndpointCard';
import EndpointModal from './EndpointModal';
import { Button, Card, CardBody } from '@heroui/react';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useEndpoints, useDeleteEndpoint } from '../../hooks/queries/useEndpointQueries';
import { useProject } from '../../hooks/queries/useProjectQueries';
import { DEFAULT_SCHEMA } from '../../types/schema';

/**
 * Props for the EndpointList component
 */
interface EndpointListProps {
  projectId: string;
}

/**
 * Component for displaying and managing a list of endpoints for a project
 */
const EndpointList: React.FC<EndpointListProps> = ({ projectId }) => {
  // TanStack Query hooks
  const {
    data: endpoints = [],
    isLoading,
    isError,
    error,
    refetch: refetchEndpoints
  } = useEndpoints(projectId);

  const { data: project } = useProject(projectId);
  const deleteEndpointMutation = useDeleteEndpoint(projectId);

  // Local state
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);

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
      await deleteEndpointMutation.mutateAsync(endpoint.id);
    } catch (error) {
      console.error('Failed to delete endpoint:', error);
    }
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading endpoints...</div>;
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch endpoints';
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{errorMessage}</p>
        <Button onPress={() => refetchEndpoints()}>Try Again</Button>
      </div>
    );
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
              isDeleting={deleteEndpointMutation.isPending && deleteEndpointMutation.variables === endpoint.id}
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
          onClose={() => {
            setShowCreateModal(false);
          }}
          projectId={projectId}
          onUpdate={() => refetchEndpoints()}
          initialData={{
            requireAuth: project?.requireAuth || false,
            path: '',
            method: 'GET' as EndpointMethod,
            schemaDefinition: project?.defaultSchema || DEFAULT_SCHEMA,
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
          onUpdate={() => refetchEndpoints()}
          initialData={selectedEndpoint}
        />
      )}
    </div>
  );
};

export default EndpointList;
