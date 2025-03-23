// client/src/components/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import ProjectList from "./projects/ProjectList";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">
            Create Dynamic REST APIs in Seconds
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Build configurable mock REST APIs with dynamic data generation for
            your frontend prototyping needs. No coding required!
          </p>
          <Link to="/projects/new" className="btn btn-primary">
            Create Your First API
          </Link>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your API Projects</h2>
          <Link to="/projects/new" className="btn btn-success">
            New Project
          </Link>
        </div>

        <ProjectList />
      </div>

      {/* How It Works Section */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Project</h3>
            <p className="text-gray-600">
              Start by creating a new project to organize your API endpoints.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Define Endpoints</h3>
            <p className="text-gray-600">
              Configure endpoints with JSON schemas using dynamic value
              generators.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Use Your API</h3>
            <p className="text-gray-600">
              Share the API URL with your team and start making requests
              instantly.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-10 pt-10 border-t">
          <h3 className="text-xl font-semibold mb-6 text-center">
            Key Features
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold mb-2">Dynamic Data Generation</h4>
              <p className="text-sm text-gray-600">
                Use{" "}
                <code className="bg-blue-100 px-1 rounded">(random:type)</code>{" "}
                syntax to generate realistic data for your API responses.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-md">
              <h4 className="font-semibold mb-2">RESTful Endpoints</h4>
              <p className="text-sm text-gray-600">
                Support for GET, POST, PUT, DELETE with proper status codes and
                response formats.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-md">
              <h4 className="font-semibold mb-2">Authentication</h4>
              <p className="text-sm text-gray-600">
                Add API key authentication to secure your endpoints when needed.
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-md">
              <h4 className="font-semibold mb-2">Pagination</h4>
              <p className="text-sm text-gray-600">
                Built-in support for pagination with skip and take parameters.
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-md">
              <h4 className="font-semibold mb-2">Documentation</h4>
              <p className="text-sm text-gray-600">
                Auto-generated API documentation with examples in multiple
                languages.
              </p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-md">
              <h4 className="font-semibold mb-2">Simulated Network Delay</h4>
              <p className="text-sm text-gray-600">
                Configure response delays to simulate real-world API conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
