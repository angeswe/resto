import React, { useEffect, useState } from 'react';
import { Endpoint, EndpointData } from '../../types/project';
import Modal from '../common/Modal';
import EndpointForm from './EndpointForm';
import { useCreateEndpoint, useUpdateEndpoint } from '../../hooks/queries/useEndpointQueries';

/**
 * Props for the EndpointModal component
 */
interface EndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUpdate?: () => void;
  initialData?: Endpoint | EndpointData;
}

/**
 * Modal component for creating or editing endpoints
 */
const EndpointModal: React.FC<EndpointModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onUpdate,
  initialData
}) => {
  // Get the current theme from the document
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Update theme based on document class
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setTheme(isDarkNow ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Determine if we're editing an existing endpoint
  const isEditing = initialData && 'id' in initialData;
  const endpointId = isEditing ? initialData.id : '';

  // Use TanStack Query hooks for mutations
  const createEndpointMutation = useCreateEndpoint(projectId);
  const updateEndpointMutation = useUpdateEndpoint(endpointId, projectId);

  // Determine if a mutation is in progress
  const isSubmitting = createEndpointMutation.isPending || updateEndpointMutation.isPending;

  const handleSubmit = async (endpointData: EndpointData) => {
    try {
      if (isEditing) {
        await updateEndpointMutation.mutateAsync(endpointData);
      } else {
        await createEndpointMutation.mutateAsync(endpointData);
      }

      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }

      // Close the modal
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error('Error in endpoint submission:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Endpoint" : "Create New Endpoint"}
    >
      <div className="space-y-4">
        <EndpointForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
          isSubmitting={isSubmitting}
          theme={theme}
        />
      </div>
    </Modal>
  );
};

export default EndpointModal;
