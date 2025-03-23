// client/src/components/ProjectSettings.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { projectsApi } from "../utils/api";
import { copyToClipboard } from "../utils/helpers";
import Loading from "./common/Loading";
import EndpointList from "./endpoints/EndpointList";
import EndpointModal from "./endpoints/EndpointModal";
import ProjectForm from "./projects/ProjectForm";

const ProjectSettings = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [editing, setEditing] = useState(false);

  // Endpoint creation modal state
  const [showEndpointModal, setShowEndpointModal] = useState(false);

  useEffect(() => {
    fetchProject();

    // Generate share link
    const baseUrl = window.location.origin;
    setShareLink(`${baseUrl}/mock/${projectId}`);
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Failed to copy link");
    }
  };

  const handleDeleteProject = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${project.name}"? This will delete all endpoints and cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await projectsApi.deleteProject(projectId);
      toast.success("Project deleted");
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete project");
    }
  };

  const handleUpdateProject = async (updatedProject) => {
    try {
      const data = await projectsApi.updateProject(projectId, updatedProject);
      setProject(data);
      setEditing(false);
      toast.success("Project updated");
    } catch (err) {
      toast.error("Failed to update project");
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading project..." />;
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || "Project not found"}
        </div>
        <button onClick={() => navigate("/")} className="mt-4 btn btn-primary">
          Back to Projects
        </button>
      </div>
    );
  }

  // If in editing mode, show the form
  if (editing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Edit Project</h1>
          <p className="text-gray-600">Update your project details below.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProjectForm
            project={project}
            onSubmit={handleUpdateProject}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setEditing(true)}
            className="btn btn-secondary"
          >
            Edit Project
          </button>

          <button onClick={handleDeleteProject} className="btn btn-danger">
            Delete Project
          </button>
        </div>
      </div>

      {/* Share Link Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Share Your API</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
          />
          <button
            onClick={handleCopyShareLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Share this base URL with others to access your mock API. Add
            specific endpoint paths to this URL.
          </p>
          <Link
            to={`/projects/${projectId}`}
            className="btn btn-primary text-sm"
          >
            View API Docs
          </Link>
        </div>
      </div>

      {/* Endpoints Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">API Endpoints</h2>
          <button
            onClick={() => setShowEndpointModal(true)}
            className="btn btn-success"
          >
            Add Endpoint
          </button>
        </div>

        <EndpointList projectId={projectId} />
      </div>

      {/* New Endpoint Modal */}
      {showEndpointModal && (
        <EndpointModal
          projectId={projectId}
          onClose={() => setShowEndpointModal(false)}
          onSave={() => {
            setShowEndpointModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectSettings;
