// client/src/components/projects/ProjectCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { formatDate, truncate } from "../../utils/helpers";

const ProjectCard = ({ project, onDelete }) => {
  const { projectId, name, description, createdAt } = project;

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      window.confirm(
        `Are you sure you want to delete "${name}"? This will delete all endpoints and cannot be undone.`
      )
    ) {
      onDelete(projectId);
    }
  };

  const handleCopyProjectId = (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard
      .writeText(projectId)
      .then(() => {
        alert("Project ID copied to clipboard");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="card-body">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 h-12 overflow-hidden">
          {truncate(description || "No description provided", 80)}
        </p>

        <div className="mt-4 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <span className="font-medium">Project ID:</span>
            <button
              onClick={handleCopyProjectId}
              className="ml-2 font-mono text-blue-600 hover:text-blue-800 text-xs"
              title="Copy Project ID"
            >
              {truncate(projectId, 12)}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 inline-block ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center mt-1">
            <span className="font-medium">Created:</span>
            <span className="ml-2">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="card-footer flex justify-between">
        <div className="space-x-3">
          <Link
            to={`/projects/${projectId}`}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            API Docs
          </Link>
          <Link
            to={`/projects/${projectId}/settings`}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Edit
          </Link>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
