import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import SchemaEditor from '../projects/SchemaEditor';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../contexts/AppContext';

interface EndpointTesterProps {
  isOpen: boolean;
  onClose: () => void;
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
  };
  projectId: string;
}

interface ResponseInfo {
  status: number;
  statusText: string;
  data: Record<string, any>;
  message: string | null;
}

const EndpointTester: React.FC<EndpointTesterProps> = ({ isOpen, onClose, endpoint, projectId }) => {
  const { theme } = useAppContext();
  const [requestBody, setRequestBody] = useState<Record<string, any>>(
    typeof endpoint.schemaDefinition === 'string'
      ? JSON.parse(endpoint.schemaDefinition)
      : endpoint.schemaDefinition
  );
  const [response, setResponse] = useState<ResponseInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && endpoint.schemaDefinition) {
      setRequestBody(
        typeof endpoint.schemaDefinition === 'string'
          ? JSON.parse(endpoint.schemaDefinition)
          : endpoint.schemaDefinition
      );
      handleTest();
    }
  }, [isOpen, endpoint.schemaDefinition]);

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
          body: JSON.stringify(requestBody)
        } : {})
      });

      const data = await fetchResponse.json();
      
      // Ensure we always get a plain object
      const parsedData = typeof data === 'string' 
        ? JSON.parse(data) 
        : data;

      // If the parsed data has a data property, use that
      const finalData = parsedData.data || parsedData;

      // If the data is still a string, try to parse it
      const normalizedData = typeof finalData === 'string' 
        ? JSON.parse(finalData) 
        : finalData;

      // Final fallback - handle primitive values
      const finalResponseData = typeof normalizedData === 'object' && normalizedData !== null
        ? normalizedData
        : { value: String(normalizedData) };

      setResponse({
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: finalResponseData,
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
              <SchemaEditor
                value={typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody, null, 2)}
                onChange={(value) => {
                  try {
                    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
                    setRequestBody(parsed);
                    handleTest();
                  } catch (e) {
                    // Handle invalid JSON if needed
                  }
                }}
                isValid={true}  // We don't need validation here since we're just displaying
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* Response or Error */}
        {(response || error || loading) && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Response</h3>
            {loading && (
              <div className="text-sm font-mono p-2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Testing endpoint...
              </div>
            )}
            {error ? (
              <div className="text-red-600 whitespace-pre-wrap">{error}</div>
            ) : response && (
              <>
                <div className={`text-sm font-mono p-2 rounded ${response.status >= 200 && response.status < 300
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  {response.status} {response.statusText}
                  {response.message && (
                    <div className="mt-1 text-xs opacity-80">{response.message}</div>
                  )}
                </div>
                <div className="overflow-hidden border border-[var(--border-color)] rounded-lg mt-2">
                  <SchemaEditor
                    value={response.data}
                    onChange={() => {}}  // No need for onChange since it's read-only
                    isValid={true}
                    theme={theme}
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
