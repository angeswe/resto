// client/src/components/ProjectCreation.jsx
import React from "react";
import ProjectForm from "./projects/ProjectForm";

const ProjectCreation = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-600">
          Start by giving your API project a name and optional description.
          You'll be able to add endpoints after creating the project.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <ProjectForm />
      </div>
    </div>
  );
};

export default ProjectCreation;
