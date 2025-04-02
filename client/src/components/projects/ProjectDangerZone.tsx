import React from 'react';
import { Button, Card, CardBody } from '@heroui/react';

interface ProjectDangerZoneProps {
  onDelete: () => Promise<void>;
  className?: string;
}

const ProjectDangerZone: React.FC<ProjectDangerZoneProps> = ({ onDelete, className }) => {
  return (
    <Card className={className}>
      <CardBody>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-red-700">Danger Zone</h3>
            <p className="text-sm text-red-600">
              Once you delete a project, there is no going back
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-100"
            onClick={onDelete}
          >
            Delete Project
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProjectDangerZone;
