// client/src/components/projects/ProjectList.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import Loading from "../common/Loading";
import { useAppContext } from "../../contexts/AppContext";

const ProjectList = () => {
  const { projects, loading, error, deleteProject } = useAppContext();

  // Handle project deletion
  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
    } catch (err) {
      // Error is already handled in the context
      console.error("Delete project error:", err);
    }
  };

  if (loading) {
    return <Loading message="Loading your projects..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
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
            <h3 className="text-sm font-medium">Error loading projects</h3>
            <div className="mt-2 text-sm">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-3">No Projects Yet</h3>
        <p className="text-gray-600 mb-6">
          You haven't created any API projects yet. Get started by creating your
          first project.
        </p>
        <Link to="/projects/new" className="btn btn-primary">
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.projectId}
          project={project}
          onDelete={handleDeleteProject}
        />
      ))}
    </div>
  );
};

export default ProjectList;
