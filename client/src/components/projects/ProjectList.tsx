import { Link } from 'react-router-dom';
import { PlusIcon, FolderIcon } from "@heroicons/react/24/solid";
import { Button, Card, CardBody } from "@heroui/react";
import ProjectCard from "./ProjectCard";
import Loading from "../common/Loading";
import { useProjects, useDeleteProject } from "../../hooks/queries/useProjectQueries";

/**
 * Displays a list of all projects with options to create and manage them
 */
const ProjectList = () => {
  // Use TanStack Query hooks instead of AppContext
  const { data: projects = [], isLoading, isError, error } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  // Sort projects by creation date (newest first)
  const sortedProjects = [...projects].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    await deleteProjectMutation.mutateAsync(projectId);
  };

  if (isLoading) {
    return <Loading message="Loading your projects..." />;
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Error loading projects</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button
            color="primary"
            variant="solid"
            className="mt-4"
            onPress={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
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
            variant="solid"
            startContent={<PlusIcon className="h-5 w-5" />}
          >
            Create Project
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
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
                variant="solid"
                className="bg-primary-600 text-white hover:bg-primary-700"
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
