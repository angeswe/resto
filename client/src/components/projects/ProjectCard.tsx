import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarIcon,
  TrashIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody, Button } from '@heroui/react';
import { timeAgo } from '@/utils/helpers';
import { Endpoint } from '@/types/project';

interface Project {
  id: string;
  name: string;
  description: string;
  defaultSchema: object;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  endpoints: Endpoint[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
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
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
            {project.endpoints?.length || 0} endpoints
          </span>
          <Button
            isIconOnly
            variant="light"
            color="danger"
            onPress={handleDelete}
            startContent={<TrashIcon className="h-5 w-5" />}
            aria-label="Delete project"
          />
        </div>
      </CardHeader>
      <CardBody className="pt-0 px-4 pb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center text-[var(--text-secondary)]">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">
              Created {timeAgo(project.createdAt)}
            </span>
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)]">
          {project.description || 'No description provided'}
        </p>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;
