// client/src/components/docs/EndpointDocs.jsx
import React, { useState } from "react";
import { CodeMirror } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getMethodBadgeClass, generateSampleData } from "../../utils/helpers";
import CodeExamples from "./CodeExamples";

const EndpointDocs = ({ endpoint, baseUrl }) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Generate sample response based on schema and method
  const generateSampleResponse = () => {
    const isCollection =
      endpoint.method === "GET" && !endpoint.path.includes(":id");

    if (endpoint.method === "DELETE") {
      return { status: 204, body: null };
    }

    // Generate sample data from schema
    const sampleData = generateSampleData(endpoint.schemaDefinition);

    if (isCollection && endpoint.supportPagination) {
      return {
        status: 200,
        body: {
          data: [sampleData, { ...sampleData, id: "2nd-sample-id" }],
          pagination: {
            total: endpoint.count,
            skip: 0,
            take: 10,
            pages: Math.ceil(endpoint.count / 10),
          },
        },
      };
    } else if (isCollection) {
      return {
        status: 200,
        body: [sampleData, { ...sampleData, id: "2nd-sample-id" }],
      };
    } else if (endpoint.method === "POST") {
      return {
        status: 201,
        body: sampleData,
      };
    } else {
      return {
        status: 200,
        body: sampleData,
      };
    }
  };

  const sampleResponse = generateSampleResponse();

  return (
    <>
      <div className="border-b">
        <div className="flex items-center p-4">
          <span className={getMethodBadgeClass(endpoint.method)}>
            {endpoint.method}
          </span>
          <span className="ml-2 font-mono text-lg">{endpoint.path}</span>
        </div>

        <div className="flex border-t">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "schema"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Schema
          </button>
          <button
            onClick={() => setActiveTab("examples")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "examples"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
          >
            Code Examples
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Endpoint Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full URL</h3>
                <code className="block bg-gray-100 p-2 rounded mt-1 font-mono text-sm">
                  {baseUrl}
                  {endpoint.path}
                </code>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Authentication
                </h3>
                <p className="mt-1">
                  {endpoint.requireAuth ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                      Bearer Token Required
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                      No Authentication
                    </span>
                  )}
                </p>
              </div>

              {endpoint.method === "GET" && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Pagination
                    </h3>
                    <p className="mt-1">
                      {endpoint.supportPagination ? (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                          Supported
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                          Not Supported
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Items Count
                    </h3>
                    <p className="mt-1 font-mono">{endpoint.count}</p>
                  </div>
                </>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Response Delay
                </h3>
                <p className="mt-1 font-mono">{endpoint.delay}ms</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-600">
                {endpoint.method === "GET" &&
                  endpoint.path.includes(":id") &&
                  "Returns a single item by ID."}
                {endpoint.method === "GET" &&
                  !endpoint.path.includes(":id") &&
                  "Returns a collection of items."}
                {endpoint.method === "POST" &&
                  "Creates a new item and returns the created resource."}
                {endpoint.method === "PUT" &&
                  "Updates an existing item and returns the updated resource."}
                {endpoint.method === "PATCH" &&
                  "Partially updates an existing item and returns the updated resource."}
                {endpoint.method === "DELETE" &&
                  "Deletes an item. Returns no content with 204 status code."}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Sample Response</h3>
              <div className="bg-gray-800 rounded-md overflow-hidden">
                <div className="flex items-center px-4 py-2 bg-gray-900">
                  <span className="text-gray-400 text-sm">Status: </span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded ${
                      sampleResponse.status >= 200 &&
                      sampleResponse.status < 300
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {sampleResponse.status}
                  </span>
                </div>
                {sampleResponse.body && (
                  <SyntaxHighlighter
                    language="json"
                    style={atomDark}
                    customStyle={{ margin: 0, padding: 16 }}
                  >
                    {JSON.stringify(sampleResponse.body, null, 2)}
                  </SyntaxHighlighter>
                )}
                {!sampleResponse.body && (
                  <div className="p-4 text-gray-400 italic text-sm">
                    No response body (204 No Content)
                  </div>
                )}
              </div>
            </div>

            {endpoint.requireAuth && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800 mb-2">
                    This endpoint requires authentication with a Bearer token.
                  </p>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Authorization Header:
                  </h4>
                  <code className="block bg-white p-2 rounded font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>

                  {endpoint.apiKeys && endpoint.apiKeys.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Valid API Keys:
                      </h4>
                      <ul className="list-disc list-inside">
                        {endpoint.apiKeys.map((key, index) => (
                          <li key={index} className="font-mono text-sm">
                            {key}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {endpoint.method === "GET" && endpoint.supportPagination && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Pagination</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800 mb-2">
                    This endpoint supports pagination through query parameters.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        Skip Parameter:
                      </h4>
                      <code className="block bg-white p-2 rounded font-mono text-sm">
                        ?skip=0
                      </code>
                      <p className="text-xs text-blue-600 mt-1">
                        Number of items to skip (default: 0)
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        Take Parameter:
                      </h4>
                      <code className="block bg-white p-2 rounded font-mono text-sm">
                        ?take=10
                      </code>
                      <p className="text-xs text-blue-600 mt-1">
                        Number of items to return (default: all)
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      Example:
                    </h4>
                    <code className="block bg-white p-2 rounded font-mono text-sm">
                      {baseUrl}
                      {endpoint.path}?skip=10&take=5
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schema Tab */}
        {activeTab === "schema" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Data Schema</h2>
            <div className="bg-gray-800 rounded-md overflow-hidden">
              <CodeMirror
                value={JSON.stringify(endpoint.schemaDefinition, null, 2)}
                height="400px"
                extensions={[json()]}
                editable={false}
                theme="dark"
              />
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-md font-semibold text-blue-800 mb-2">
                Random Value Types
              </h3>
              <p className="text-blue-800 mb-3">
                This schema uses{" "}
                <code className="bg-blue-100 px-1 rounded">(random:type)</code>{" "}
                syntax to generate random values. Static values are preserved
                exactly as specified.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Basic Types:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:string)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:number)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:boolean)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:integer)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:float)
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Identifiers:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:id)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:uuid)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:objectid)
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Date & Time:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:date)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:datetime)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:time)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:timestamp)
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Internet:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:email)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:url)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:domain)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:ip)
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Personal:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:firstname)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:lastname)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:fullname)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:phone)
                      </code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Business:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:company)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:jobtitle)
                      </code>
                    </li>
                    <li>
                      <code className="bg-blue-100 px-1 rounded">
                        (random:department)
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Code Examples Tab */}
        {activeTab === "examples" && (
          <CodeExamples endpoint={endpoint} baseUrl={baseUrl} />
        )}
      </div>
    </>
  );
};

export default EndpointDocs;
