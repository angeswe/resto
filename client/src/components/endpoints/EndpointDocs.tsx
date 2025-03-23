import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import CodeExamples from './CodeExamples';

interface Endpoint {
  path: string;
  method: string;
  schemaDefinition: object;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  delay: number;
}

const EndpointDocs: React.FC = () => {
  const { id: projectId, endpointId } = useParams<{ id: string; endpointId: string }>();
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/projects/${projectId}/endpoints/${endpointId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch endpoint');
        }
        const data = await response.json();
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

  const responseExample = endpoint.supportPagination
    ? {
        data: [endpoint.schemaDefinition],
        total: endpoint.count,
        page: 1,
        totalPages: Math.ceil(endpoint.count / 10)
      }
    : [endpoint.schemaDefinition];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Endpoint Details</h3>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Method</dt>
                <dd className="mt-1 text-sm text-gray-900">{endpoint.method}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Path</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{endpoint.path}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Items Count</dt>
                <dd className="mt-1 text-sm text-gray-900">{endpoint.count}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Response Delay</dt>
                <dd className="mt-1 text-sm text-gray-900">{endpoint.delay}ms</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Pagination</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {endpoint.supportPagination ? 'Enabled' : 'Disabled'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Authentication</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {endpoint.requireAuth ? 'Required (API Key)' : 'Not Required'}
                </dd>
              </div>
            </dl>
          </div>

          {endpoint.supportPagination && (
            <div>
              <h3 className="text-lg font-medium mb-2">Query Parameters</h3>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parameter
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        page
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        Page number (default: 1)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        limit
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
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
              <h3 className="text-lg font-medium mb-2">Authentication</h3>
              <p className="text-sm text-gray-600 mb-2">
                This endpoint requires authentication. Include your API key in the request headers:
              </p>
              <div className="bg-gray-50 rounded-md p-4">
                <code className="text-sm">
                  X-API-Key: YOUR_API_KEY
                </code>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Response Schema</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <CodeMirror
                value={JSON.stringify(endpoint.schemaDefinition, null, 2)}
                height="200px"
                extensions={[json()]}
                editable={false}
                theme="light"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Example Response</h3>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <CodeMirror
                value={JSON.stringify(responseExample, null, 2)}
                height="200px"
                extensions={[json()]}
                editable={false}
                theme="light"
              />
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
