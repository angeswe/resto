import { FC } from "react";
import { Link } from "react-router-dom";
import { PlusIcon, FolderIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardBody } from "@heroui/react";
import ProjectCard from "./ProjectCard";
import Loading from "../common/Loading";
import { useAppContext } from "../../contexts/AppContext";

const ProjectList: FC = () => {
  const { projects, loading, error, deleteProject } = useAppContext();

  // Sort projects by creation date (newest first)
  const sortedProjects = [...projects].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
          <Button
            as={Link}
            to="/projects/new"
            color="primary"
            startContent={<PlusIcon className="h-5 w-5" />}
          >
            Create Project
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
              <h3 className="text-sm text-red-800 font-medium">Error loading projects</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardBody className="flex flex-col items-center justify-center py-12">
            <FolderIcon className="h-12 w-12 text-default-400" />
            <h3 className="mt-2 text-sm font-medium">No projects</h3>
            <p className="mt-1 text-sm text-default-500">
              Get started by creating a new project.
            </p>
            <div className="mt-6">
              <Button
                as={Link}
                to="/projects/new"
                color="primary"
                startContent={<PlusIcon className="h-5 w-5" />}
              >
                Create Project
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
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
