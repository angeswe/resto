import React from 'react';
import { endpointsApi } from '../../utils/api';
import { EndpointData, Endpoint } from '../../types/project';
import Modal from '../common/Modal';
import EndpointForm from './EndpointForm';

interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUpdate?: () => void;
  initialData?: Endpoint | EndpointData;
}

const EndpointModal: React.FC<EndpointModalProps> = ({ isOpen, onClose, projectId, onUpdate, initialData }) => {
  if (!projectId) {
    return null;
  }

  const handleSubmit = async (endpointData: EndpointData) => {
    try {
      if (initialData && 'id' in initialData) {
        await endpointsApi.updateEndpoint(initialData.id, endpointData);
      } else {
        await endpointsApi.createEndpoint(projectId, endpointData);
      }
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error('Failed to save endpoint:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData && 'id' in initialData ? "Edit Endpoint" : "Create New Endpoint"}>
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
