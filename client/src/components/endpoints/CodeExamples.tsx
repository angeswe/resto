import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeExamplesProps {
  endpoint: {
    path: string;
    method: string;
    requireAuth: boolean;
    supportPagination: boolean;
    schemaDefinition: object;
  };
  projectId: string;
}

const CodeExamples: React.FC<CodeExamplesProps> = ({ endpoint, projectId }) => {
  const { theme } = useTheme();
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

axios.${endpoint.method.toLowerCase()}("${baseUrl}"${endpoint.supportPagination ? ', {\n  params: { page: 1, limit: 10 }' : ''}${
      endpoint.requireAuth ? `${endpoint.supportPagination ? ',' : ', {\n'}  headers: {
    "X-API-Key": "YOUR_API_KEY"
  }` : ''
}${endpoint.supportPagination || endpoint.requireAuth ? '\n}' : ''})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`,
  };

  const responseSchema = {
    success: true,
    data: endpoint.schemaDefinition
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Code Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-[var(--text-primary)]">cURL</h4>
            <div className="rounded-md overflow-hidden border border-[var(--border-color)]">
              <CodeMirror
                value={examples.curl}
                height="100px"
                extensions={[json()]}
                editable={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
                className="!bg-[var(--bg-secondary)]"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-[var(--text-primary)]">Fetch</h4>
            <div className="rounded-md overflow-hidden border border-[var(--border-color)]">
              <CodeMirror
                value={examples.fetch}
                height="150px"
                extensions={[json()]}
                editable={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
                className="!bg-[var(--bg-secondary)]"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 text-[var(--text-primary)]">Axios</h4>
            <div className="rounded-md overflow-hidden border border-[var(--border-color)]">
              <CodeMirror
                value={examples.axios}
                height="150px"
                extensions={[json()]}
                editable={false}
                theme={theme === 'dark' ? 'dark' : 'light'}
                className="!bg-[var(--bg-secondary)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExamples;
