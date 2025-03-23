import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

interface CodeExamplesProps {
  endpoint: {
    path: string;
    method: string;
    requireAuth: boolean;
    supportPagination: boolean;
  };
  projectId: string;
}

const CodeExamples: React.FC<CodeExamplesProps> = ({ endpoint, projectId }) => {
  const baseUrl = `http://localhost:3000/mock/${projectId}${endpoint.path}`;
  
  const examples = {
    curl: `curl ${baseUrl}${endpoint.requireAuth ? ' \\\n  -H "X-API-Key: YOUR_API_KEY"' : ''}${
      endpoint.supportPagination ? ' \\\n  -G \\\n  -d "page=1" \\\n  -d "limit=10"' : ''
    }`,
    fetch: `fetch("${baseUrl}"${endpoint.supportPagination ? '?page=1&limit=10' : ''}", {
  method: "${endpoint.method}",${endpoint.requireAuth ? `
  headers: {
    "X-API-Key": "YOUR_API_KEY"
  },` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    axios: `import axios from 'axios';

axios.get("${baseUrl}"${endpoint.supportPagination ? ', {\n  params: { page: 1, limit: 10 }' : ''}${
      endpoint.requireAuth ? `${endpoint.supportPagination ? ',' : ', {\n'}  headers: {
    "X-API-Key": "YOUR_API_KEY"
  }` : ''
}${endpoint.supportPagination || endpoint.requireAuth ? '\n}' : ''})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`,
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Code Examples</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">cURL</h4>
          <div className="bg-gray-50 rounded-md">
            <CodeMirror
              value={examples.curl}
              height="auto"
              extensions={[json()]}
              editable={false}
              theme="light"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Fetch</h4>
          <div className="bg-gray-50 rounded-md">
            <CodeMirror
              value={examples.fetch}
              height="auto"
              extensions={[json()]}
              editable={false}
              theme="light"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Axios</h4>
          <div className="bg-gray-50 rounded-md">
            <CodeMirror
              value={examples.axios}
              height="auto"
              extensions={[json()]}
              editable={false}
              theme="light"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExamples;
