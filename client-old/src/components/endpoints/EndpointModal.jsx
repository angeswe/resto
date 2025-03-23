// client/src/components/endpoints/EndpointModal.jsx
import React from "react";
import EndpointForm from "./EndpointForm";

const EndpointModal = ({ projectId, endpoint, onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">
            {endpoint ? "Edit Endpoint" : "Create New Endpoint"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-10rem)]">
          <EndpointForm
            projectId={projectId}
            endpoint={endpoint}
            onSave={onSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default EndpointModal;
