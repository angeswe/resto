import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import CodeExamples from './CodeExamples';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { METHOD_STATUS_CODES } from '../../types/http';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../contexts/AppContext';

interface EndpointDocsProps {
  endpoint: {
    id: string;
    path: string;
    method: string;
    schemaDefinition: string | Record<string, any>;
    count: number;
    supportPagination: boolean;
    requireAuth: boolean;
    apiKeys: string[];
    delay: number;
    responseType: string;
    parameterPath: string;
    responseHttpStatus: string;
    projectId: string;
  };
  projectId: string;
}

const EndpointDocs: React.FC<EndpointDocsProps> = ({ endpoint, projectId }) => {
  const { theme } = useAppContext();
  const [copied, setCopied] = useState(false);

  // Parse schema if it's a string
  const parsedSchema = typeof endpoint.schemaDefinition === 'string'
    ? JSON.parse(endpoint.schemaDefinition)
    : endpoint.schemaDefinition;

  // Now parsedSchema is guaranteed to be Record<string, any>
  const schema: Record<string, any> = parsedSchema;

  // Create an example response by replacing schema placeholders with realistic values
  const generateExampleValue = (schema: Record<string, any>): Record<string, any> => {
    if (typeof schema === 'string') {
      return { value: schema };
    }

    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'string' && value.startsWith('(random:')) {
        const type = value.match(/^\(random:(\w+)\)$/)?.[1] || 'string';
        switch (type) {
          case 'uuid':
            result[key] = '123e4567-e89b-12d3-a456-426614174000';
            break;
          case 'string':
            result[key] = 'example';
            break;
          case 'name':
            result[key] = 'John Doe';
            break;
          case 'email':
            result[key] = 'example@email.com';
            break;
          case 'number':
            result[key] = 42;
            break;
          case 'boolean':
            result[key] = true;
            break;
          case 'datetime':
            result[key] = new Date().toISOString();
            break;
          case 'date':
            result[key] = new Date().toISOString().split('T')[0];
            break;
          default:
            result[key] = value;
        }
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => generateExampleValue({ value: item }).value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = generateExampleValue(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  const responseExample = endpoint.supportPagination
    ? {
      data: generateExampleValue(schema),
      total: endpoint.count,
      page: 1,
      totalPages: Math.ceil(endpoint.count / 10)
    }
    : generateExampleValue(schema);

  // Convert schema to string for display
  const schemaString = typeof endpoint.schemaDefinition === 'string'
    ? endpoint.schemaDefinition
    : JSON.stringify(endpoint.schemaDefinition, null, 2);

  const fullPath = API_URLS.getMockUrl(endpoint.projectId, endpoint.path);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link
          to={`/projects/${projectId}/settings`}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-color)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Project Settings
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">API Documentation</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Full URL</h3>
            <div className="mt-2 flex items-center gap-2 p-3 bg-[var(--bg-secondary)] rounded-md border border-[var(--border-color)]">
              <a href={fullPath} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                {fullPath}
              </a>
              <button
                onClick={copyToClipboard}
                className="p-1 hover:bg-[var(--bg-hover)] rounded transition-colors"
                title="Copy to clipboard"
              >
                <ClipboardIcon className="h-4 w-4 text-[var(--text-secondary)]" />
              </button>
              {copied && (
                <span className="text-xs text-green-500 dark:text-green-400">Copied!</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Endpoint Details</h3>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Method</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{endpoint.method}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Path</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)] font-mono">{endpoint.path}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Items Count</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{endpoint.count}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Status Code</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">
                  <span className="font-mono">{endpoint.responseHttpStatus}</span> ({METHOD_STATUS_CODES[endpoint.method as keyof typeof METHOD_STATUS_CODES].find(s => s.code === endpoint.responseHttpStatus)?.text})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Response Delay</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">{endpoint.delay}ms</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Pagination</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">
                  {endpoint.supportPagination ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--text-secondary)]">Authentication</dt>
                <dd className="mt-1 text-sm text-[var(--text-primary)]">
                  {endpoint.requireAuth ? 'Required (API Key)' : 'Not Required'}
                </dd>
              </div>
            </dl>
          </div>

          {endpoint.supportPagination && (
            <div>
              <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">Query Parameters</h3>
              <div className="overflow-hidden border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)]">
                <table className="min-w-full divide-y divide-[var(--border-color)]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                        page
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        number
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        Page number (default: 1)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">
                        limit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        number
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        Items per page (default: 10, max: 100)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {endpoint.requireAuth && (
            <div>
              <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">Authentication</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-2">
                This endpoint requires authentication. Include your API key in the request headers:
              </p>
              <div className="bg-[var(--bg-secondary)] rounded-md p-4 border border-[var(--border-color)]">
                <code className="text-sm text-[var(--text-primary)]">
                  X-API-Key: YOUR_API_KEY
                </code>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">Schema Definition</h3>
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  {endpoint.supportPagination ? 'Schema definition with pagination:' : 'Schema definition:'}
                </p>
                <div className="overflow-hidden border border-[var(--border-color)] rounded-lg">
                  <CodeMirror
                    value={schemaString}
                    height="200px"
                    extensions={[json()]}
                    readOnly
                    theme={theme === 'dark' ? dracula : githubLight}
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">Example Response</h3>
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  {endpoint.supportPagination ? 'Example response with pagination:' : 'Example response:'}
                </p>
                <div className="overflow-hidden border border-[var(--border-color)] rounded-lg">
                  <CodeMirror
                    value={JSON.stringify(responseExample, null, 2)}
                    height="200px"
                    extensions={[json()]}
                    readOnly
                    theme={theme === 'dark' ? dracula : githubLight}
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <CodeExamples
            endpointId={endpoint.id}
            projectId={projectId}
            method={endpoint.method}
            path={endpoint.path}
            schemaDefinition={parsedSchema}
            requireAuth={endpoint.requireAuth}
            apiKeys={endpoint.apiKeys}
          />
        </div>
      </div>
    </div>
  );
};

export default EndpointDocs;
