// client/src/components/endpoints/EndpointList.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { endpointsApi } from "../../utils/api";
import Loading from "../common/Loading";
import EndpointModal from "./EndpointModal";
import { getMethodBadgeClass } from "../../utils/helpers";

const EndpointList = ({ projectId }) => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for endpoint editing
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [showEndpointModal, setShowEndpointModal] = useState(false);

  // Fetch endpoints on component mount
  useEffect(() => {
    fetchEndpoints();
  }, [projectId]);

  // Fetch all endpoints for the project
  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await endpointsApi.getEndpoints(projectId);
      setEndpoints(data);
    } catch (err) {
      setError("Failed to load endpoints");
      toast.error("Failed to load endpoints");
    } finally {
      setLoading(false);
    }
  };

  // Handle endpoint deletion
  const handleDeleteEndpoint = async (endpointId) => {
    if (!window.confirm("Are you sure you want to delete this endpoint?")) {
      return;
    }

    try {
      await endpointsApi.deleteEndpoint(projectId, endpointId);
      setEndpoints(endpoints.filter((ep) => ep._id !== endpointId));
      toast.success("Endpoint deleted");
    } catch (err) {
      toast.error("Failed to delete endpoint");
    }
  };

  // Open modal to edit an endpoint
  const handleEditEndpoint = (endpoint) => {
    setEditingEndpoint(endpoint);
    setShowEndpointModal(true);
  };

  // Open modal to create a new endpoint
  const handleCreateEndpoint = () => {
    setEditingEndpoint(null);
    setShowEndpointModal(true);
  };

  // Close the endpoint modal
  const handleCloseModal = () => {
    setShowEndpointModal(false);
    setEditingEndpoint(null);
  };

  // Handle save in the endpoint modal
  const handleSaveEndpoint = () => {
    setShowEndpointModal(false);
    setEditingEndpoint(null);
    fetchEndpoints(); // Refresh the list
  };

  if (loading) {
    return <Loading message="Loading endpoints..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Error loading endpoints</h3>
            <div className="mt-2 text-sm">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
        <h2 className="font-semibold">Endpoints</h2>
        <button
          onClick={handleCreateEndpoint}
          className="btn btn-success text-sm"
        >
          New Endpoint
        </button>
      </div>

      {endpoints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No endpoints created yet.</p>
          <p className="mt-2">
            Click "New Endpoint" to create your first API endpoint.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Path</th>
                <th className="px-4 py-2 text-left">Items</th>
                <th className="px-4 py-2 text-left">Auth</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {endpoints.map((endpoint) => (
                <tr key={endpoint._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={getMethodBadgeClass(endpoint.method)}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {endpoint.path}
                  </td>
                  <td className="px-4 py-3">{endpoint.count}</td>
                  <td className="px-4 py-3">
                    {endpoint.requireAuth ? (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                        Required
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEndpoint(endpoint)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEndpoint(endpoint._id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Endpoint Modal */}
      {showEndpointModal && (
        <EndpointModal
          projectId={projectId}
          endpoint={editingEndpoint}
          onClose={handleCloseModal}
          onSave={handleSaveEndpoint}
        />
      )}
    </div>
  );
};

export default EndpointList;
