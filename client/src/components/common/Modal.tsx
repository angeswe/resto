import React from 'react';
import { Modal as HeroModal, ModalContent, ModalHeader, ModalBody } from '@heroui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * Modal component wrapper around HeroUI Modal
 * Maintains the same API for backward compatibility
 */
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // If not open, return null to match the previous behavior
  if (!isOpen) return null;

  return (
    <HeroModal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex justify-between items-center">
              <span className="text-lg font-medium">{title}</span>
            </ModalHeader>
            <ModalBody>
              {children}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </HeroModal>
  );
};

export default Modal;
