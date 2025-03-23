import React from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  defaultSchema: object;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 bg-[var(--card-bg)] border border-[var(--card-border)]">
      <div className="card-header">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              <Link to={`/project/${project.id}/settings`} className="hover:text-[var(--accent-color)]">
                {project.name}
              </Link>
            </h3>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-sm text-[var(--text-secondary)]">
                Created {formatDate(project.createdAt)}
              </span>
              {project.requireAuth && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--auth-bg)] text-[var(--auth-text)]">
                  Auth Required
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
              {project.description || 'No description provided'}
            </p>
          </div>
          <div className="ml-4">
            <button
              onClick={handleDelete}
              className="text-[var(--text-secondary)] hover:text-[var(--delete-hover)]"
              title="Delete project"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
