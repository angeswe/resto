import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import { Button } from '@heroui/react';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../contexts/AppContext';

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
        <CodeMirror
          value={codeExamples[activeTab]}
          height="200px"
          extensions={[json()]}
          readOnly
          theme={theme === 'dark' ? dracula : githubLight}
          className="rounded-md"
        />
      </div>
    </div>
  );
};

export default CodeExamples;
