import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { Button } from '@heroui/react';
import { API_URLS } from '../../config/api';

interface CodeExamplesProps {
  projectId: string;
  endpointId: string;
  method: string;
  path: string;
  schemaDefinition: Record<string, any>;
}

const CodeExamples: React.FC<CodeExamplesProps> = ({
  projectId,
  endpointId,
  method,
  path,
  schemaDefinition,
}) => {
  const baseUrl = `${API_URLS.base}/projects/${projectId}/endpoints/${endpointId}`;
  const curlExample = `curl -X ${method} ${baseUrl}${path} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(schemaDefinition, null, 2)}'`;

  const fetchExample = `fetch("${baseUrl}${path}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(${JSON.stringify(schemaDefinition, null, 2)})
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

  const axiosExample = `axios.${method.toLowerCase()}("${baseUrl}${path}", ${JSON.stringify(
    schemaDefinition,
    null,
    2
  )})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;

  const [activeTab, setActiveTab] = React.useState<'curl' | 'fetch' | 'axios'>('curl');

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
          onClick={() => setActiveTab('curl')}
        >
          cURL
        </Button>
        <Button
          variant={activeTab === 'fetch' ? 'solid' : 'light'}
          onClick={() => setActiveTab('fetch')}
        >
          Fetch
        </Button>
        <Button
          variant={activeTab === 'axios' ? 'solid' : 'light'}
          onClick={() => setActiveTab('axios')}
        >
          Axios
        </Button>
      </div>
      <div className="bg-card rounded-lg p-4">
        <CodeMirror
          value={codeExamples[activeTab]}
          height="200px"
          extensions={[json()]}
          editable={false}
          className="border rounded-md border-divider"
        />
      </div>
    </div>
  );
};

export default CodeExamples;
