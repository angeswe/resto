import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EndpointForm from './EndpointForm';

const NewEndpoint: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  if (!projectId) {
    return <div>Project ID is required</div>;
  }

  const handleClose = () => {
    // Use :id instead of :projectId to match the route in App.tsx
    navigate(`/projects/${projectId}/settings`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-[var(--text-primary)]">Create New Endpoint</h1>
      <EndpointForm 
        projectId={projectId}
        onClose={handleClose}
        onSuccess={handleClose}
      />
    </div>
  );
};

export default NewEndpoint;
