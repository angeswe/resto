import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { githubLight } from '@uiw/codemirror-theme-github';
import { API_URLS } from '../../config/api';
import { useAppContext } from '../../hooks/useAppContext';

/**
 * Component for displaying code examples for API endpoints
 */
interface CodeExamplesProps {
  endpointId?: string; // Optional, not used in current implementation
  projectId: string;
  method: string;
  path: string;
  schemaDefinition: Record<string, unknown>;
  requireAuth: boolean;
  apiKeys: string[];
}

const CodeExamples: React.FC<CodeExamplesProps> = ({
  projectId,
  method,
  path,
  schemaDefinition,
  requireAuth,
  apiKeys
}) => {
  const { theme } = useAppContext();
  const baseUrl = `${API_URLS.base}/api/mock/${projectId}`;
  const authHeader = requireAuth && apiKeys.length > 0
    ? `\n  -H "X-API-Key: ${apiKeys[0]}"`
    : '';

  // Only include request body for POST and PUT methods
  const hasRequestBody = method === 'POST' || method === 'PUT';
  const requestBodyParam = hasRequestBody
    ? `\n  -d '${JSON.stringify(schemaDefinition, null, 2)}'`
    : '';

  const curlExample = `curl -X ${method} "${baseUrl}${path}" \\
  -H "Content-Type: application/json"${authHeader}${requestBodyParam}`;

  const fetchExample = `fetch("${baseUrl}${path}", {
  method: "${method}",
  headers: {
    "Content-Type": "application/json"${requireAuth && apiKeys.length > 0 ? `,
    "X-API-Key": "${apiKeys[0]}"` : ''}
  }${hasRequestBody ? `,
  body: JSON.stringify(${JSON.stringify(schemaDefinition, null, 2).replace(/"([^"]+)":/g, '$1:')})` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

  const axiosConfig = requireAuth && apiKeys.length > 0
    ? `, {
    headers: {
      "X-API-Key": "${apiKeys[0]}"
    }
  }`
    : '';

  const axiosExample = `import axios from 'axios';

axios.${method.toLowerCase()}("${baseUrl}${path}"${hasRequestBody ? `, ${JSON.stringify(schemaDefinition, null, 2).replace(/"([^"]+)":/g, '$1:')}` : ''}${axiosConfig})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-md font-medium mb-2 text-[var(--text-primary)]">cURL</h3>
        <CodeMirror
          value={curlExample}
          height="auto"
          extensions={[javascript()]}
          theme={theme === 'dark' ? dracula : githubLight}
          editable={false}
        />
      </div>

      <div>
        <h3 className="text-md font-medium mb-2 text-[var(--text-primary)]">JavaScript (fetch)</h3>
        <CodeMirror
          value={fetchExample}
          height="auto"
          extensions={[javascript()]}
          theme={theme === 'dark' ? dracula : githubLight}
          editable={false}
        />
      </div>

      <div>
        <h3 className="text-md font-medium mb-2 text-[var(--text-primary)]">JavaScript (axios)</h3>
        <CodeMirror
          value={axiosExample}
          height="auto"
          extensions={[javascript()]}
          theme={theme === 'dark' ? dracula : githubLight}
          editable={false}
        />
      </div>
    </div>
  );
};

export default CodeExamples;
