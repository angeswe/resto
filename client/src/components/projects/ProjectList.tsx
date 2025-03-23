import { FC } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import Loading from "../common/Loading";
import { useAppContext } from "../../contexts/AppContext";

const ProjectList: FC = () => {
  const { projects, loading, error, deleteProject } = useAppContext();

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-3xl sm:text-xl font-semibold text-[var(--text-primary)]">Projects</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Create and manage your dynamic REST API endpoints
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/projects/new"
            className="btn-primary"
          >
            Create Project
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 !text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="!text-sm !text-red-800 font-medium">Error loading projects</h3>
              <div className="mt-2 !text-sm !text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!error && projects.length === 0 ? (
        <div className="text-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12">
          <svg
            className="mx-auto h-12 w-12 !text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 !text-sm !text-gray-900 dark:!text-gray-100 font-medium">No projects</h3>
          <p className="mt-1 !text-sm !text-gray-500 dark:!text-gray-400">Get started by creating a new project</p>
          <div className="mt-6">
            <Link
              to="/projects/new"
              className="btn-primary"
            >
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
