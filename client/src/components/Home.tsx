import { FC } from 'react';
import { Link } from "react-router-dom";
import ProjectList from "./projects/ProjectList";

const Home: FC = () => {
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
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Configure Endpoints</h3>
            <p className="text-gray-600">
              Define your API endpoints with custom data schemas and response types.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Use Your API</h3>
            <p className="text-gray-600">
              Get a unique URL for your API and start making requests right away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
