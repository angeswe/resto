import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Card, CardBody, Input, Textarea, Button } from "@heroui/react";
import { useAppContext } from "../../contexts/AppContext";
import { ProjectData } from "../../types/project";
import { toast } from 'react-toastify';

const defaultJsonSchema = {}; // assuming this is defined somewhere

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim()) {
      toast.error("Project name is required");
      setLoading(false);
      return;
    }

    const projectData: ProjectData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      defaultSchema: defaultJsonSchema,
      defaultCount: 10,
      requireAuth: false,
      apiKeys: [],
    };

    try {
      const response = await addProject(projectData);
      navigate(`/projects/${response.id}/settings`);
    } catch (error) {
      console.error("Error creating project:", error);
      // Error toast is handled by AppContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create New Project</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Set up a new REST API project with customizable endpoints and dynamic data generation.
        </p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                id="name"
                name="name"
                label="Project Name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="My API Project"
                isRequired
                description="Choose a unique name for your project"
              />
            </div>

            <div>
              <Textarea
                id="description"
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your API project..."
                description="Brief description of your API project and its purpose."
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                as={Link}
                to="/"
                variant="light"
                startContent={<ArrowLeftIcon className="h-5 w-5" />}
              >
                Back
              </Button>
              <Button
                type="submit"
                color="primary"
                startContent={<PlusIcon className="h-5 w-5" />}
                isLoading={loading}
              >
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default NewProject;
