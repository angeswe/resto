import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  KeyIcon, 
  TrashIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody, Button, Badge } from '@heroui/react';

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
    if (!dateString) return 'Unknown date';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow duration-200 border border-[var(--card-border)]"
    >
      <CardHeader className="flex justify-between items-start p-4">
        <div className="flex items-center gap-2">
          <DocumentIcon className="h-5 w-5 text-[var(--text-secondary)]" />
          <h3 className="text-lg font-medium">
            <Link to={`/projects/${project.id}/settings`} className="hover:text-[var(--accent-color)]">
              {project.name}
            </Link>
          </h3>
        </div>
        <Button
          isIconOnly
          variant="light"
          color="danger"
          onClick={handleDelete}
          startContent={<TrashIcon className="h-5 w-5" />}
          aria-label="Delete project"
        />
      </CardHeader>
      <CardBody className="pt-0 px-4 pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center text-[var(--text-secondary)]">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">
              Created {formatDate(project.createdAt)}
            </span>
          </div>
          {project.requireAuth && (
            <div className="flex items-center">
              <Badge variant="flat" color="warning">
                <KeyIcon className="h-3 w-3 mr-1" />
                Auth Required
              </Badge>
            </div>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          {project.description || 'No description provided'}
        </p>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;
