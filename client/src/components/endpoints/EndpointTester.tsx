import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import SchemaEditor from '../projects/SchemaEditor';
import { useTestEndpoint } from '../../hooks/queries/useEndpointQueries';
import { useAppContext } from '../../contexts/AppContextWithTanstack';

interface EndpointTesterProps {
  isOpen: boolean;
  onClose: () => void;
  endpoint: {
    id: string;
    path: string;
    method: string;
    schemaDefinition: string | Record<string, any>;
    count: number;
    //supportPagination: boolean;
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

/**
 * Component for testing endpoints with live requests
 */
const EndpointTester: React.FC<EndpointTesterProps> = ({ isOpen, onClose, endpoint, projectId }) => {
  const { theme } = useAppContext();
  const [requestBody, setRequestBody] = useState<Record<string, any>>(
    typeof endpoint.schemaDefinition === 'string'
      ? JSON.parse(endpoint.schemaDefinition)
      : endpoint.schemaDefinition
  );
  const [response, setResponse] = useState<ResponseInfo | null>(null);
  const [error, setError] = useState<string>('');

  // Use the TanStack Query mutation hook for testing endpoints
  const testEndpointMutation = useTestEndpoint(projectId);
  const loading = testEndpointMutation.isPending;

  // Reset state when the modal opens with new endpoint data
  useEffect(() => {
    if (isOpen && endpoint.schemaDefinition) {
      // Parse schema definition if it's a string
      const parsedSchema = typeof endpoint.schemaDefinition === 'string'
        ? JSON.parse(endpoint.schemaDefinition)
        : endpoint.schemaDefinition;

      setRequestBody(parsedSchema);

      // Automatically run the test when the modal opens
      handleTest();
    }
  }, [isOpen, endpoint.schemaDefinition]);

  const handleTest = async () => {
    try {
      setError('');
      setResponse(null);

      // Build the path with parameter for single-item endpoints
      let path = endpoint.path;
      if (endpoint.responseType === 'single') {
        path += `/${endpoint.parameterPath}`;
        // For GET requests, replace the parameter with a test value
        if (endpoint.method === 'GET') {
          path = path.replace(endpoint.parameterPath, '123');
        }
      }

      // Check if authentication is required but no API key is available
      if (endpoint.requireAuth && (!endpoint.apiKeys || endpoint.apiKeys.length === 0)) {
        setError('This endpoint requires authentication, but no API key is available.');
        return;
      }

      // Use the mutation hook to test the endpoint
      const result = await testEndpointMutation.mutateAsync({
        path,
        method: endpoint.method,
        body: (endpoint.method === 'POST' || endpoint.method === 'PUT') ? requestBody : null,
        requireAuth: endpoint.requireAuth,
        apiKey: endpoint.apiKeys && endpoint.apiKeys.length > 0 ? endpoint.apiKeys[0] : ''
      });

      // Process the response data
      const normalizedData = typeof result === 'string'
        ? JSON.parse(result)
        : result;

      // Final fallback - handle primitive values
      const finalResponseData = typeof normalizedData === 'object' && normalizedData !== null
        ? normalizedData
        : { value: String(normalizedData) };

      // Set the response for display
      setResponse({
        status: 200, // Default success status
        statusText: 'OK',
        data: finalResponseData,
        message: null
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test endpoint';
      setError(errorMessage);
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

        {/* Test Button */}
        {/* <div className="flex justify-end">
          <Button
            color="primary"
            isLoading={loading}
            onPress={handleTest}
          >
            {loading ? 'Testing...' : 'Test Endpoint'}
          </Button>
        </div> */}

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
                    onChange={() => { }}  // No need for onChange since it's read-only
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
