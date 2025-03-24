import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useTheme } from '../contexts/ThemeContext';

const Docs: React.FC = () => {
  const { theme } = useTheme();
  const exampleSchema = `{
  "id": "(random:uuid)",
  "name": "(random:name)",
  "email": "(random:email)",
  "createdAt": "(random:datetime)"
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Documentation</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Getting Started</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Resto is a powerful mock REST API server that helps you prototype and test your applications
            without setting up a real backend.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Creating a Project</h2>
          <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)]">
            <li>Click the "New Project" button on the home page</li>
            <li>Enter a name and description for your project</li>
            <li>Set up your default schema and configuration</li>
            <li>Click "Create Project" to save</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Adding Endpoints</h2>
          <ol className="list-decimal list-inside space-y-2 text-[var(--text-secondary)]">
            <li>Navigate to your project's settings</li>
            <li>Click "Add Endpoint" in the endpoints section</li>
            <li>Configure your endpoint's path, method, and schema</li>
            <li>Save your changes</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Available Data Types</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Use these data types with the <code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">(random:type)</code> syntax:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Basic Types</h3>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">uuid</code> - Unique identifier</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">string</code> - Random word</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">number</code> - Integer (1-1000)</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">boolean</code> - True or false</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Text Content</h3>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">name</code> - Full name</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">paragraph</code> - Random paragraph</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">sentences</code> - Multiple sentences</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">company</code> - Company name</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Contact & Location</h3>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">email</code> - Email address</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">phone</code> - Phone number</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">address</code> - Street address</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Web & Media</h3>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">url</code> - Web URL</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">image</code> - Image URL</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">date</code> - Recent date</li>
                <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">datetime</code> - Date and time</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Schema Format</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Here's an example schema showing how to use the data types:
          </p>
          <div className="rounded-lg overflow-hidden border border-[var(--border-color)]">
            <CodeMirror
              value={exampleSchema}
              height="160px"
              extensions={[json()]}
              theme={theme}
              readOnly
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
              }}
            />
          </div>
          <p className="text-[var(--text-secondary)] mt-4">
            This is the default schema used when creating a new project. You can customize it with any of the data types shown above.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Authorization</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Each project has its own unique ID that must be included in the API URL:
          </p>
          <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto mb-4">
            <code className="text-sm text-[var(--text-primary)]">http://localhost:3001/api/mock/:projectId/your-endpoint</code>
          </pre>
          <p className="text-[var(--text-secondary)]">
            The project ID acts as a namespace, ensuring your endpoints don't conflict with other projects.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">Pagination</h2>
          <p className="text-[var(--text-secondary)] mb-4">
            When your endpoint returns multiple items, you can use pagination by adding query parameters:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[var(--text-secondary)] mb-4">
            <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">page</code> - Page number (default: 1)</li>
            <li><code className="text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1 rounded">limit</code> - Items per page (default: 10)</li>
          </ul>
          <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto mb-4">
            <code className="text-sm text-[var(--text-primary)]">http://localhost:3001/api/mock/:projectId/users?page=2&limit=20</code>
          </pre>
          <p className="text-[var(--text-secondary)]">
            The response will be an array of items based on your schema:
          </p>
          <div className="rounded-lg overflow-hidden border border-[var(--border-color)]">
            <CodeMirror
              value={paginationExample}
              height="160px"
              extensions={[json()]}
              theme={theme}
              readOnly
              basicSetup={{
                lineNumbers: true,
                foldGutter: true,
                highlightActiveLine: false,
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Docs;
