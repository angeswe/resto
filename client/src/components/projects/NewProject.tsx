import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { ProjectData } from "../../types/project";
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

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

    console.log('Creating project with data:', projectData);

    try {
      const response = await addProject(projectData);
      console.log('Created project:', response);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)]">
            Project Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] px-3 py-2 focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
            placeholder="My API Project"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[var(--text-primary)]">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] px-3 py-2 focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
            placeholder="Describe your API project..."
          />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Brief description of your API project and its purpose.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium text-sm hover:text-[var(--text-primary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--border-color)]"
          >
            <svg 
              className="mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg 
              className="mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProject;
