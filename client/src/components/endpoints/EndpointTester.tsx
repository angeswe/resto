import React, { useState } from 'react';
import { Endpoint } from '../../types/project';
import Modal from '../common/Modal';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../contexts/AppContext';

interface EndpointTesterProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: Endpoint;
  projectId: string;
}

interface ResponseInfo {
  status: number;
  statusText: string;
  data: any;
  message: string | null;
}

const EndpointTester: React.FC<EndpointTesterProps> = ({ isOpen, onClose, endpoint, projectId }) => {
  const { theme } = useAppContext();
  const [requestBody, setRequestBody] = useState<string>(
    JSON.stringify(endpoint.schemaDefinition, null, 2)
  );
  const [response, setResponse] = useState<ResponseInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    try {
      setError('');
      setResponse(null);
      setLoading(true);

      // Use the same backend URL as the rest of the application
      const baseUrl = API_URLS.base;
      let url = `${baseUrl}/mock/${projectId}${endpoint.path}`;

      // Only append parameter path for single-item endpoints
      if (endpoint.responseType === 'single') {
        url += `/${endpoint.parameterPath}`;
        // For GET requests, replace the parameter with a test value
        if (endpoint.method === 'GET') {
          url = url.replace(endpoint.parameterPath, '123');
        }
      }

      console.log('Testing endpoint:', {
        url,
        method: endpoint.method,
        path: endpoint.path,
        body: requestBody
      });

      const fetchResponse = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(endpoint.requireAuth && endpoint.apiKeys.length > 0
            ? { 'X-API-Key': endpoint.apiKeys[0] }
            : {})
        },
        ...(endpoint.method === 'POST' || endpoint.method === 'PUT' ? {
          body: requestBody
        } : {})
      });

      const data = await fetchResponse.json();
      setResponse({
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data,
        message: fetchResponse.headers.get('X-Status-Message')
      });
    } catch (err) {
      console.error('Test request failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to test endpoint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Test Endpoint">
      <div className="space-y-6">
        {/* Request Body Editor (only for POST and PUT methods) */}
        {(endpoint.method === 'POST' || endpoint.method === 'PUT') && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Request Body</h3>
            <div className="overflow-hidden border border-[var(--border-color)] rounded-lg">
              <CodeMirror
                value={requestBody}
                height="200px"
                extensions={[json()]}
                onChange={(value) => setRequestBody(value)}
                theme={theme === 'dark' ? dracula : githubLight}
                className="!bg-[var(--bg-secondary)] rounded-md"
              />
            </div>
          </div>
        )}

        {/* Test Button */}
        <div className="flex justify-end">
          <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white font-medium text-sm hover:bg-[var(--accent-hover)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Endpoint'}
          </button>
        </div>

        {/* Response or Error */}
        {(response || error) && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Response</h3>
            {error ? (
              <div className="text-red-600 whitespace-pre-wrap">{error}</div>
            ) : response && (
              <>
                <div className={`text-sm font-mono p-2 rounded ${
                  response.status >= 200 && response.status < 300 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {response.status} {response.statusText}
                  {response.message && (
                    <div className="mt-1 text-xs opacity-80">{response.message}</div>
                  )}
                </div>
                <div className="overflow-hidden border border-[var(--border-color)] rounded-lg mt-2">
                  <CodeMirror
                    value={JSON.stringify(response.data, null, 2)}
                    height="300px"
                    extensions={[json()]}
                    editable={false}
                    theme={theme === 'dark' ? dracula : githubLight}
                    className="border rounded-md border-[var(--input-border)]"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EndpointTester;
