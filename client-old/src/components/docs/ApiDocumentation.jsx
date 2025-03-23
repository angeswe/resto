// client/src/components/docs/ApiDocumentation.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { projectsApi, endpointsApi } from "../../utils/api";
import { copyToClipboard, getMethodBadgeClass } from "../../utils/helpers";
import Loading from "../common/Loading";
import EndpointDocs from "./EndpointDocs";

const ApiDocumentation = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [endpoints, setEndpoints] = useState([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    fetchProjectData();
    setBaseUrl(`${window.location.origin}/mock/${projectId}`);
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details
      const projectResponse = await projectsApi.getProject(projectId);
      setProject(projectResponse);

      // Fetch endpoints
      const endpointsResponse = await endpointsApi.getEndpoints(projectId);
      setEndpoints(endpointsResponse);

      // Select first endpoint if available
      if (endpointsResponse.length > 0) {
        setSelectedEndpoint(endpointsResponse[0]);
      }
    } catch (err) {
      setError("Failed to load API documentation");
      toast.error("Failed to load API documentation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBaseUrl = async () => {
    const success = await copyToClipboard(baseUrl);

    if (success) {
      toast.success("Base URL copied to clipboard!");
    } else {
      toast.error("Failed to copy URL");
    }
  };

  if (loading) {
    return <Loading message="Loading API documentation..." />;
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || "Project not found"}
        </div>
        <Link to="/" className="mt-4 inline-block btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name} API</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Link
            to={`/projects/${projectId}/settings`}
            className="btn btn-secondary"
          >
            Edit API
          </Link>
        </div>
      </div>

      {/* Base URL Display */}
      <div className="bg-gray-100 p-4 rounded-md mb-8">
        <div className="flex items-center">
          <span className="text-gray-700 font-semibold mr-2">Base URL:</span>
          <code className="flex-1 bg-white p-2 rounded font-mono text-sm">
            {baseUrl}
          </code>
          <button
            onClick={handleCopyBaseUrl}
            className="ml-2 btn btn-primary text-sm"
          >
            Copy
          </button>
        </div>
      </div>

      {endpoints.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Endpoints Available</h2>
          <p className="text-gray-600 mb-6">
            This API doesn't have any endpoints configured yet.
          </p>
          <Link
            to={`/projects/${projectId}/settings`}
            className="btn btn-success"
          >
            Create Endpoint
          </Link>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Endpoints Sidebar */}
          <div className="w-64 bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-100 border-b">
              <h2 className="font-semibold">Endpoints</h2>
            </div>
            <div className="divide-y">
              {endpoints.map((endpoint) => (
                <button
                  key={endpoint._id}
                  onClick={() => setSelectedEndpoint(endpoint)}
                  className={`w-full text-left p-3 hover:bg-gray-50 flex items-center ${
                    selectedEndpoint && selectedEndpoint._id === endpoint._id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <span
                    className={`inline-block w-14 text-center ${getMethodBadgeClass(
                      endpoint.method
                    )}`}
                  >
                    {endpoint.method}
                  </span>
                  <span className="ml-2 font-mono text-sm truncate">
                    {endpoint.path}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Documentation */}
          {selectedEndpoint && (
            <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden">
              <EndpointDocs endpoint={selectedEndpoint} baseUrl={baseUrl} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiDocumentation;
