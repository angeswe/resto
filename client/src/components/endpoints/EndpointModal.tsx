import React from 'react';
import { endpointsApi } from '../../utils/api';
import { toast } from 'react-toastify';
import { EndpointData, Endpoint } from '../../types/project';
import Modal from '../common/Modal';
import EndpointForm from './EndpointForm';

interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUpdate?: () => void;
  initialData?: Endpoint;
}

const EndpointModal: React.FC<EndpointModalProps> = ({ isOpen, onClose, projectId, onUpdate, initialData }) => {
  if (!projectId) {
    return null;
  }

  const handleSubmit = async (endpointData: EndpointData) => {
    try {
      if (initialData) {
        await endpointsApi.updateEndpoint(initialData.id, endpointData);
        toast.success('Endpoint updated successfully');
      } else {
        await endpointsApi.createEndpoint(projectId, endpointData);
        toast.success('Endpoint created successfully');
      }
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save endpoint:', error);
      toast.error(initialData ? 'Failed to update endpoint' : 'Failed to create endpoint');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Endpoint" : "Create New Endpoint"}>
      <div className="space-y-4">
        <EndpointForm
          projectId={projectId}
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </div>
    </Modal>
  );
};

export default EndpointModal;
