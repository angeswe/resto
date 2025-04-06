import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import CodeExamples from './CodeExamples';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { METHOD_STATUS_CODES } from '../../types/http';
import { API_URLS } from '../../config/api';
import { useEndpoint } from '../../hooks/queries/useEndpointQueries';
import { useAppContext } from '../../hooks/useAppContext';

interface EndpointDocsProps {
  endpoint?: {
    id: string;
    path: string;
    method: string;
    schemaDefinition: string | Record<string, unknown>;
    count: number;
    requireAuth: boolean;
    apiKeys: string[];
    delay: number;
    responseType: string;
    parameterPath: string;
    responseHttpStatus: string;
  };
  projectId?: string;
}

/**
 * Component for displaying endpoint documentation
 * Can be used standalone with endpoint prop or as a page with URL params
 */
const EndpointDocs: React.FC<EndpointDocsProps> = (props) => {
  // Get parameters from URL if not provided as props
  const { projectId: urlProjectId, endpointId } = useParams<{ projectId: string; endpointId: string }>();
  const navigate = useNavigate();

  // Use props or URL params
  const projectId = props.projectId || urlProjectId;

  // Use TanStack Query to fetch endpoint if not provided
  const { data: fetchedEndpoint, isLoading } = useEndpoint(
    endpointId || '',
    projectId || ''
  );

  // Use provided endpoint or fetched endpoint
  const endpoint = props.endpoint || fetchedEndpoint;

  // Get theme from context
  const { theme } = useAppContext();
  const [copied, setCopied] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no endpoint is available, show error
  if (!endpoint || !projectId) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Endpoint not found</h2>
        <p className="mb-4">The endpoint you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Project
        </button>
      </div>
    );
  }

  // Parse schema if it's a string
  const parsedSchema = typeof endpoint.schemaDefinition === 'string'
    ? JSON.parse(endpoint.schemaDefinition)
    : endpoint.schemaDefinition;

  // Now parsedSchema is guaranteed to be Record<string, unknown>
  const schema: Record<string, unknown> = parsedSchema;

  // Create an example response by replacing schema placeholders with realistic values
  const generateExampleValue = (schema: Record<string, unknown>): Record<string, unknown> => {
    if (typeof schema === 'string') {
      return { value: schema };
    }

    const result: Record<string, unknown> = {};
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

  const responseExample = endpoint.responseType === 'list'
    ? {
      data: Array.from({ length: Math.min(3, endpoint.count) }, () => generateExampleValue(schema)),
      total: endpoint.count,
      page: 1,
      totalPages: Math.ceil(endpoint.count / 10)
    }
    : generateExampleValue(schema);

  // Format the example response for display
  const formattedResponse = JSON.stringify(responseExample, null, 2);

  // Get the base URL for the mock API
  const baseUrl = API_URLS.base;

  // Build the full URL for the endpoint
  let fullUrl = `${baseUrl}/api/mock/${projectId}${endpoint.path}`;
  if (endpoint.responseType === 'single') {
    fullUrl += `/${endpoint.parameterPath}`;
  }

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get the status code text
  const statusCode = endpoint.responseHttpStatus || '200';
  let statusText = 'OK';

  // Find the status text for the given method and status code
  if (endpoint.method in METHOD_STATUS_CODES) {
    const methodStatusCodes = METHOD_STATUS_CODES[endpoint.method as keyof typeof METHOD_STATUS_CODES];
    const statusCodeObj = methodStatusCodes.find(s => s.code === statusCode);
    if (statusCodeObj) {
      statusText = statusCodeObj.text;
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Link
          to={`/projects/${projectId}/settings`}
          className="inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Project
        </Link>
      </div>

      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--border-color)] mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            <span className={`px-2 py-1 text-sm font-medium rounded mr-2 ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
              }`}>
              {endpoint.method}
            </span>
            {endpoint.path}
          </h1>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Endpoint URL</h2>
          </div>
          <div className="flex items-center">
            <div className="flex-1 bg-[var(--bg-tertiary)] p-3 rounded-l-md border border-[var(--border-color)] font-mono text-sm overflow-x-auto">
              {fullUrl}
            </div>
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-md"
              title="Copy to clipboard"
            >
              <ClipboardIcon className="h-5 w-5" />
            </button>
          </div>
          {copied && (
            <div className="mt-2 text-sm text-green-600">Copied to clipboard!</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Details</h2>
            <div className="bg-[var(--bg-tertiary)] p-4 rounded-md border border-[var(--border-color)]">
              <div className="mb-4">
                <h3 className="font-medium text-[var(--text-primary)]">Response Status</h3>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">
                  <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                    {statusCode} {statusText}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-[var(--text-primary)]">Response Type</h3>
                <div className="mt-1 text-sm text-[var(--text-secondary)]">
                  {endpoint.responseType === 'list' ? 'List of items' : 'Single item'}
                </div>
              </div>

              {endpoint.requireAuth && (
                <div className="mb-4">
                  <h3 className="font-medium text-[var(--text-primary)]">Authentication</h3>
                  <div className="mt-1 text-sm text-[var(--text-secondary)]">
                    Required (API Key)
                  </div>
                </div>
              )}

              {endpoint.delay > 0 && (
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">Response Delay</h3>
                  <div className="mt-1 text-sm text-[var(--text-secondary)]">
                    {endpoint.delay} ms
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Schema Definition</h2>
            <div className="bg-[var(--bg-tertiary)] p-4 rounded-md border border-[var(--border-color)] h-full">
              <CodeMirror
                value={JSON.stringify(schema, null, 2)}
                height="200px"
                extensions={[json()]}
                theme={theme === 'dark' ? dracula : githubLight}
                editable={false}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Example Response</h2>
          <div className="bg-[var(--bg-tertiary)] p-4 rounded-md border border-[var(--border-color)]">
            <CodeMirror
              value={formattedResponse}
              height="300px"
              extensions={[json()]}
              theme={theme === 'dark' ? dracula : githubLight}
              editable={false}
            />
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-[var(--text-primary)]">Code Examples</h2>
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
