// client/src/components/projects/ProjectForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";

const ProjectForm = ({ project = null }) => {
  const navigate = useNavigate();
  const { addProject, updateProject } = useAppContext();

  // Set initial form state based on whether we're editing an existing project
  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Project name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (project) {
        // Update existing project
        const updatedProject = await updateProject(project.projectId, formData);
        navigate(`/projects/${updatedProject.projectId}/settings`);
      } else {
        // Create new project
        const newProject = await addProject(formData);
        navigate(`/projects/${newProject.projectId}/settings`);
      }
    } catch (err) {
      console.error("Project form submission error:", err);
      // Error is already handled in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Project Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${
            validationErrors.name ? "border-red-500" : ""
          }`}
          placeholder="My REST API"
          disabled={isSubmitting}
          required
        />
        {validationErrors.name && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`form-input ${
            validationErrors.description ? "border-red-500" : ""
          }`}
          placeholder="Describe what this API is for"
          rows="3"
          disabled={isSubmitting}
        ></textarea>
        {validationErrors.description && (
          <p className="mt-1 text-sm text-red-600">
            {validationErrors.description}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/500 characters
        </p>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {project ? "Updating..." : "Creating..."}
            </>
          ) : project ? (
            "Update Project"
          ) : (
            "Create Project"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
