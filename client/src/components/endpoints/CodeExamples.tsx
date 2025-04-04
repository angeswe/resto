import React, { useState } from 'react';
import SchemaEditor from '../projects/SchemaEditor';
import { Button } from '@heroui/react';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../contexts/AppContext';

interface CodeExamplesProps {
  endpointId: string;
  projectId: string;
  method: string;
  path: string;
  schemaDefinition: string;
  requireAuth: boolean;
  apiKeys: string[];
}

const CodeExamples: React.FC<CodeExamplesProps> = ({
  endpointId,
  projectId,
  method,
  path,
  schemaDefinition,
  requireAuth,
  apiKeys
}) => {
  const baseUrl = `${API_URLS.base}/projects/${projectId}/endpoints/${endpointId}`;
  const authHeader = requireAuth && apiKeys.length > 0 
    ? `\n  -H "Authorization: Bearer ${apiKeys[0]}"` 
    : '';

  const curlExample = `curl -X ${method} ${baseUrl}${path} \\
  -H "Content-Type: application/json"${authHeader} \\
  -d '${schemaDefinition}'`;

  const fetchExample = `fetch("${baseUrl}${path}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",${requireAuth && apiKeys.length > 0 ? `
    "Authorization": "Bearer ${apiKeys[0]}"` : ''}
  },
  body: ${schemaDefinition}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

  const axiosConfig = requireAuth && apiKeys.length > 0 
    ? `, {
    headers: {
      "Authorization": "Bearer ${apiKeys[0]}"
    }
  }`
    : '';

  const axiosExample = `axios.${method.toLowerCase()}("${baseUrl}${path}", ${schemaDefinition}${axiosConfig})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;

  const { theme } = useAppContext();
  const [activeTab, setActiveTab] = useState<'curl' | 'fetch' | 'axios'>('curl');

  const codeExamples = {
    curl: curlExample,
    fetch: fetchExample,
    axios: axiosExample,
  };

  return (
    <div className="mt-6">
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === 'curl' ? 'solid' : 'light'}
          onPress={() => setActiveTab('curl')}
        >
          cURL
        </Button>
        <Button
          variant={activeTab === 'fetch' ? 'solid' : 'light'}
          onPress={() => setActiveTab('fetch')}
        >
          Fetch
        </Button>
        <Button
          variant={activeTab === 'axios' ? 'solid' : 'light'}
          onPress={() => setActiveTab('axios')}
        >
          Axios
        </Button>
      </div>
      <div className="bg-card rounded-lg p-4">
        <SchemaEditor
          value={JSON.stringify(codeExamples[activeTab], null, 2)}
          onChange={() => {}}
          isValid={true}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default CodeExamples;
