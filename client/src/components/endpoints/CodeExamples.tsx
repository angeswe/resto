import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../contexts/AppContext';

interface CodeExamplesProps {
  endpointId: string;
  projectId: string;
  method: string;
  path: string;
  schemaDefinition: Record<string, any>;
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
  const { theme } = useAppContext();
  const baseUrl = `${API_URLS.base}/projects/${projectId}/endpoints/${endpointId}`;
  const authHeader = requireAuth && apiKeys.length > 0 
    ? `\n  -H "Authorization: Bearer ${apiKeys[0]}"` 
    : '';

  const curlExample = `curl -X ${method} ${baseUrl}${path} \\
  -H "Content-Type: application/json"${authHeader} \\
  -d ${JSON.stringify(schemaDefinition, null, 2)}`;

  const fetchExample = `fetch("${baseUrl}${path}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json"${requireAuth && apiKeys.length > 0 ? `,
    "Authorization": "Bearer ${apiKeys[0]}"` : ''}
  },
  body: JSON.stringify(${JSON.stringify(schemaDefinition, null, 2).replace(/"([^"]+)":/g, '$1:')})
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

  const axiosExample = `axios.${method.toLowerCase()}("${baseUrl}${path}", ${JSON.stringify(schemaDefinition, null, 2).replace(/"([^"]+)":/g, '$1:')}${axiosConfig})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">cURL</h3>
        <CodeMirror
          value={curlExample}
          theme={theme === 'dark' ? dracula : githubLight}
          extensions={[javascript()]}
          editable={false}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Fetch</h3>
        <CodeMirror
          value={fetchExample}
          theme={theme === 'dark' ? dracula : githubLight}
          extensions={[javascript()]}
          editable={false}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Axios</h3>
        <CodeMirror
          value={axiosExample}
          theme={theme === 'dark' ? dracula : githubLight}
          extensions={[javascript()]}
          editable={false}
        />
      </div>
    </div>
  );
};

export default CodeExamples;
