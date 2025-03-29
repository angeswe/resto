import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import CodeExamples from './CodeExamples';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { METHOD_STATUS_CODES } from '../../types/http';
import { API_URLS } from '../../config/api';

interface Endpoint {
  path: string;
  method: string;
  schemaDefinition: object;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  delay: number;
  responseHttpStatus: string;
  projectId: string;
}

const EndpointDocs: React.FC = () => {
  const { projectId, endpointId } = useParams<{ projectId: string; endpointId: string }>();
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        if (!projectId || !endpointId) return;
        const response = await fetch(API_URLS.getEndpoint(projectId, endpointId));
        if (!response.ok) {
          throw new Error('Failed to fetch endpoint');
        }
        const { data } = await response.json();
        setEndpoint(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [projectId, endpointId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !endpoint) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error || 'Endpoint not found'}</div>
      </div>
    );
  }

  const responseSchema = endpoint.supportPagination
    ? {
        ...endpoint.schemaDefinition,
        total: "(number) Total number of items",
        page: "(number) Current page number",
        totalPages: "(number) Total number of pages"
      }
    : endpoint.schemaDefinition;

  // Create an example response by replacing schema placeholders with realistic values
  const generateExampleValue = (schema: any): any => {
    if (typeof schema === 'string' && schema.startsWith('(random:')) {
      const type = schema.slice(8, -1); // Remove "(random:" and ")"
      switch (type) {
        case 'name':
          return 'John Doe';
        case 'email':
          return 'john.doe@example.com';
        case 'date':
          return '2025-03-24';
        case 'number':
          return 42;
        case 'boolean':
          return true;
        case 'string':
          return 'example';
        default:
          return 'example value';
      }
    }
    
    if (Array.isArray(schema)) {
      return schema.map(item => generateExampleValue(item));
    }
    
    if (typeof schema === 'object' && schema !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(schema)) {
        result[key] = generateExampleValue(value);
      }
      return result;
    }
    
    return schema;
  };

  const responseExample = endpoint.supportPagination
    ? {
        ...generateExampleValue(endpoint.schemaDefinition),
        total: endpoint.count,
        page: 1,
        totalPages: Math.ceil(endpoint.count / 10)
      }
    : generateExampleValue(endpoint.schemaDefinition);

  const fullPath = endpoint ? API_URLS.getMockUrl(endpoint.projectId, endpoint.path) : '';

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
              <h3 className="text-lg font-medium mb-2 text-[var(--text-primary)]">Response Schema</h3>
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-secondary)]">
                  {endpoint.supportPagination ? 'Response schema with pagination:' : 'Response schema:'}
                </p>
                <div className="overflow-hidden border border-[var(--border-color)] rounded-lg">
                  <CodeMirror
                    value={JSON.stringify(responseSchema, null, 2)}
                    height="200px"
                    extensions={[json()]}
                    editable={false}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    className="!bg-[var(--bg-secondary)]"
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
                    editable={false}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                    className="!bg-[var(--bg-secondary)]"
                  />
                </div>
              </div>
            </div>
          </div>

          <CodeExamples
            endpoint={endpoint}
            projectId={projectId || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default EndpointDocs;
