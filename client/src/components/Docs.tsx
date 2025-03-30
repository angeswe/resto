import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import { useAppContext } from '../contexts/AppContext';

const Docs: React.FC = () => {
  const { theme } = useAppContext();
  const exampleSchema = `{
    "id": "(random:uuid)",
    "name": "(random:string)",
    "createdAt": "(random:datetime)",
    "email": "(random:email)"
  }`;

  const paginationExample = `[
    {
      "id": "(random:uuid)",
      "name": "(random:name)",
      "email": "(random:email)",
      "createdAt": "(random:datetime)"
    },
    {
      "id": "(random:uuid)",
      "name": "(random:name)",
      "email": "(random:email)",
      "createdAt": "(random:datetime)"
    }
  ]`;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="mb-4">
            Resto is a powerful mock REST API server that helps you prototype and test your applications
            without setting up a real backend.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Creating a Project</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click the "New Project" button on the home page</li>
            <li>Enter a name and description for your project</li>
            <li>Set up your default schema and configuration</li>
            <li>Click "Create Project" to save</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Adding Endpoints</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Navigate to your project's settings</li>
            <li>Click "Add Endpoint" in the endpoints section</li>
            <li>Configure your endpoint's path, method, and schema</li>
            <li>Save your changes</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Available Data Types</h2>
          <p className="mb-4">
            Use these data types with the <code className="bg-card p-1 rounded">random:type</code> syntax:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Basic Types</h3>
              <ul className="space-y-2">
                <li><code className="bg-card p-1 rounded">uuid</code> - Unique identifier</li>
                <li><code className="bg-card p-1 rounded">string</code> - Random word</li>
                <li><code className="bg-card p-1 rounded">number</code> - Integer (1-1000)</li>
                <li><code className="bg-card p-1 rounded">boolean</code> - True or false</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Text Content</h3>
              <ul className="space-y-2">
                <li><code className="bg-card p-1 rounded">name</code> - Full name</li>
                <li><code className="bg-card p-1 rounded">paragraph</code> - Random paragraph</li>
                <li><code className="bg-card p-1 rounded">sentences</code> - Multiple sentences</li>
                <li><code className="bg-card p-1 rounded">company</code> - Company name</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Contact & Location</h3>
              <ul className="space-y-2">
                <li><code className="bg-card p-1 rounded">email</code> - Email address</li>
                <li><code className="bg-card p-1 rounded">phone</code> - Phone number</li>
                <li><code className="bg-card p-1 rounded">address</code> - Street address</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Web & Media</h3>
              <ul className="space-y-2">
                <li><code className="bg-card p-1 rounded">url</code> - Web URL</li>
                <li><code className="bg-card p-1 rounded">image</code> - Image URL</li>
                <li><code className="bg-card p-1 rounded">date</code> - Recent date</li>
                <li><code className="bg-card p-1 rounded">datetime</code> - Date and time</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Schema Format</h2>
          <p className="mb-4">
            Here's an example schema showing how to use the data types:
          </p>
          <div className="rounded-lg overflow-hidden border border-divider">
            <CodeMirror
              value={exampleSchema}
              height="160px"
              extensions={[json()]}
              readOnly
              theme={theme === 'dark' ? dracula : githubLight}
              className="rounded-md"
            />
          </div>
          <p className="mb-4">
            This is the default schema used when creating a new project. You can customize it with any of the data types shown above.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Authorization</h2>
          <p className="mb-4">
            Each project has its own unique ID that must be included in the API URL:
          </p>
          <pre className="bg-card p-4 rounded-lg overflow-x-auto mb-4">
            <code className="text-sm">http://localhost:3001/api/mock/:projectId/your-endpoint</code>
          </pre>
          <p className="mb-4">
            The project ID acts as a namespace, ensuring your endpoints don't conflict with other projects.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Pagination</h2>
          <p className="mb-4">
            When your endpoint returns multiple items, you can use pagination by adding query parameters:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2 mb-4">
            <li>page: The page number (default: 1)</li>
            <li>limit: Number of items per page (default: 10)</li>
          </ul>
          <pre className="bg-card p-4 rounded-lg overflow-x-auto mb-4">
            <code className="text-sm">http://localhost:3001/api/mock/:projectId/users?page=2&limit=20</code>
          </pre>
          <p className="mb-4">
            The response will be an array of items based on your schema:
          </p>
          <div className="rounded-lg overflow-hidden border border-divider">
            <CodeMirror
              value={paginationExample}
              height="160px"
              extensions={[json()]}
              readOnly
              theme={theme === 'dark' ? dracula : githubLight}
              className="rounded-md"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Docs;
