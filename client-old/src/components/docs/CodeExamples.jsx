// client/src/components/docs/CodeExamples.jsx
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copyToClipboard } from "../../utils/helpers";
import { toast } from "react-toastify";

const CodeExamples = ({ endpoint, baseUrl }) => {
  const [activeLanguage, setActiveLanguage] = useState("curl");

  // Generate code examples for different languages
  const generateCodeExample = (language) => {
    const fullUrl = `${baseUrl}${endpoint.path}`;
    const headers = endpoint.requireAuth
      ? { Authorization: "Bearer your-api-key" }
      : {};

    if (language === "curl") {
      let command = `curl -X ${endpoint.method} "${fullUrl}"`;

      if (Object.keys(headers).length > 0) {
        command += Object.entries(headers)
          .map(([key, value]) => ` \\\n  -H "${key}: ${value}"`)
          .join("");
      }

      if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
        command += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(
          {
            // Sample request body
            name: "Sample Item",
            description: "This is a sample request",
          },
          null,
          2
        )}'`;
      }

      return command;
    }

    if (language === "javascript") {
      const options = {
        method: endpoint.method,
        headers: {
          ...headers,
        },
      };

      if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(
          {
            name: "Sample Item",
            description: "This is a sample request",
          },
          null,
          2
        );
      }

      return `fetch("${fullUrl}", ${JSON.stringify(options, null, 2)})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
    }

    if (language === "python") {
      let code = `import requests

url = "${fullUrl}"
`;

      if (Object.keys(headers).length > 0) {
        code += `headers = ${JSON.stringify(headers, null, 2)}
`;
      }

      if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
        code += `payload = {
  "name": "Sample Item",
  "description": "This is a sample request"
}

response = requests.${endpoint.method.toLowerCase()}(url, json=payload${
          Object.keys(headers).length > 0 ? ", headers=headers" : ""
        })
`;
      } else {
        code += `response = requests.${endpoint.method.toLowerCase()}(url${
          Object.keys(headers).length > 0 ? ", headers=headers" : ""
        })
`;
      }

      code += `
print(response.status_code)
print(response.json())`;

      return code;
    }

    if (language === "nodejs") {
      let code = `const axios = require('axios');

const url = '${fullUrl}';
`;

      if (Object.keys(headers).length > 0) {
        code += `const headers = ${JSON.stringify(headers, null, 2)};
`;
      }

      if (["POST", "PUT", "PATCH"].includes(endpoint.method)) {
        code += `const data = {
  name: 'Sample Item',
  description: 'This is a sample request'
};

async function makeRequest() {
  try {
    const response = await axios.${endpoint.method.toLowerCase()}(url, data${
          Object.keys(headers).length > 0 ? ", { headers }" : ""
        });
    console.log('Status Code:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
`;
      } else {
        code += `async function makeRequest() {
  try {
    const response = await axios.${endpoint.method.toLowerCase()}(url${
          Object.keys(headers).length > 0 ? ", { headers }" : ""
        });
    console.log('Status Code:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
`;
      }

      code += `
makeRequest();`;

      return code;
    }

    return "Code example not available for this language";
  };

  const handleCopyCode = async () => {
    const code = generateCodeExample(activeLanguage);
    const success = await copyToClipboard(code);

    if (success) {
      toast.success("Code copied to clipboard!");
    } else {
      toast.error("Failed to copy code");
    }
  };

  const languages = [
    { id: "curl", name: "cURL", syntax: "bash" },
    { id: "javascript", name: "JavaScript", syntax: "javascript" },
    { id: "python", name: "Python", syntax: "python" },
    { id: "nodejs", name: "Node.js", syntax: "javascript" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Code Examples</h2>
        <button
          onClick={handleCopyCode}
          className="btn btn-secondary text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy Code
        </button>
      </div>

      <div className="bg-gray-800 rounded-md overflow-hidden">
        <div className="flex border-b border-gray-700">
          {languages.map((lang) => (
            <button
              key={lang.id}
              className={`px-4 py-2 font-medium text-sm ${
                activeLanguage === lang.id
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
              onClick={() => setActiveLanguage(lang.id)}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {languages.map((lang) => (
          <div
            key={lang.id}
            className={activeLanguage === lang.id ? "block" : "hidden"}
          >
            <SyntaxHighlighter
              language={lang.syntax}
              style={atomDark}
              customStyle={{ margin: 0, padding: 16 }}
              showLineNumbers
            >
              {generateCodeExample(lang.id)}
            </SyntaxHighlighter>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeExamples;
