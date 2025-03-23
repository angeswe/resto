import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { ProjectData } from "../../types/project";
import { toast } from 'react-toastify';

const defaultJsonSchema = {}; // assuming this is defined somewhere

const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { addProject } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    
    if (!name.trim()) {
      toast.error("Project name is required");
      setLoading(false);
      return;
    }

    const projectData: ProjectData = {
      name: name.trim(),
      description: description.trim(),
      defaultSchema: defaultJsonSchema,
      defaultCount: parseInt(formData.get("defaultCount") as string) || 10,
      requireAuth: formData.get("requireAuth") === "true",
      apiKeys: [],
    };

    console.log('Creating project with data:', projectData);

    try {
      const project = await addProject(projectData);
      console.log('Created project:', project);
      toast.success("Project created successfully");
      // Navigate to settings page with project ID
      navigate(`/project/${project.id}/settings`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-sm text-gray-700">
          Set up a new dynamic REST API project
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="My API Project"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe your API project"
          />
        </div>

        <div>
          <label htmlFor="defaultCount" className="block text-sm font-medium text-gray-700">
            Default Count
          </label>
          <input
            type="number"
            name="defaultCount"
            id="defaultCount"
            min="1"
            defaultValue="10"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Default number of items to return for each endpoint
          </p>
        </div>

        <div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="requireAuth"
              id="requireAuth"
              value="true"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="requireAuth" className="ml-2 block text-sm text-gray-700">
              Require Authentication
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Enable authentication for all endpoints in this project
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
