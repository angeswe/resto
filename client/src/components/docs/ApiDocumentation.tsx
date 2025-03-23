import React from 'react';

const ApiDocumentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Documentation</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">List Projects</h3>
            <p className="text-gray-600 mb-2">GET /api/projects</p>
            <p className="mb-2">Returns a list of all projects.</p>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: [{"name": "string", "description": "string", "_id": "string"}]`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Create Project</h3>
            <p className="text-gray-600 mb-2">POST /api/projects</p>
            <p className="mb-2">Creates a new project.</p>
            <div className="bg-gray-100 p-2 rounded mb-2">
              <pre className="text-sm">
                {`Request: {"name": "string", "description": "string"}`}
              </pre>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: {"name": "string", "description": "string", "_id": "string"}`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Get Project</h3>
            <p className="text-gray-600 mb-2">GET /api/projects/:id</p>
            <p className="mb-2">Returns a specific project by ID.</p>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: {"name": "string", "description": "string", "_id": "string"}`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Update Project</h3>
            <p className="text-gray-600 mb-2">PUT /api/projects/:id</p>
            <p className="mb-2">Updates a specific project.</p>
            <div className="bg-gray-100 p-2 rounded mb-2">
              <pre className="text-sm">
                {`Request: {"name": "string", "description": "string"}`}
              </pre>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: {"name": "string", "description": "string", "_id": "string"}`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Delete Project</h3>
            <p className="text-gray-600 mb-2">DELETE /api/projects/:id</p>
            <p className="mb-2">Deletes a specific project.</p>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: {"message": "Project deleted"}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">List Endpoints</h3>
            <p className="text-gray-600 mb-2">GET /api/projects/:projectId/endpoints</p>
            <p className="mb-2">Returns all endpoints for a specific project.</p>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: [{"path": "string", "method": "string", "response": "object"}]`}
              </pre>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2">Create Endpoint</h3>
            <p className="text-gray-600 mb-2">POST /api/projects/:projectId/endpoints</p>
            <p className="mb-2">Creates a new endpoint for a project.</p>
            <div className="bg-gray-100 p-2 rounded mb-2">
              <pre className="text-sm">
                {`Request: {"path": "string", "method": "string", "response": "object"}`}
              </pre>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <pre className="text-sm">
                {`Response: {"path": "string", "method": "string", "response": "object", "_id": "string"}`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApiDocumentation;
