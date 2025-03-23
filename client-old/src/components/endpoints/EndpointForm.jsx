// client/src/components/endpoints/EndpointForm.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CodeMirror } from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { endpointsApi } from "../../utils/api";
import { generateSampleData } from "../../utils/helpers";

const EndpointForm = ({ projectId, endpoint, onSave, onCancel }) => {
  // Set initial form state based on whether we're editing an existing endpoint
  const [formData, setFormData] = useState({
    path: endpoint?.path || "/api/items",
    method: endpoint?.method || "GET",
    count: endpoint?.count || 10,
    supportPagination:
      endpoint?.supportPagination !== undefined
        ? endpoint.supportPagination
        : true,
    requireAuth: endpoint?.requireAuth || false,
    apiKeys: endpoint?.apiKeys || [""],
    delay: endpoint?.delay || 200,
    schemaDefinition: endpoint?.schemaDefinition
      ? JSON.stringify(endpoint.schemaDefinition, null, 2)
      : JSON.stringify(
          {
            id: "(random:uuid)",
            name: "(random:string)",
            createdAt: "(random:datetime)",
            type: "item", // Static value example
          },
          null,
          2
        ),
  });

  const [step, setStep] = useState(1);
  const [isValidJson, setIsValidJson] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Sample data preview
  const [sampleData, setSampleData] = useState(null);
  const [showSampleData, setShowSampleData] = useState(false);

  // Validate JSON schema when it changes
  useEffect(() => {
    try {
      JSON.parse(formData.schemaDefinition);
      setIsValidJson(true);
    } catch (err) {
      setIsValidJson(false);
    }
  }, [formData.schemaDefinition]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear validation error when field is changed
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle schema changes in CodeMirror
  const handleSchemaChange = (value) => {
    setFormData({ ...formData, schemaDefinition: value });
  };

  // Handle HTTP method selection
  const handleMethodSelect = (method) => {
    setFormData({ ...formData, method });
  };

  // API Key management
  const handleAddApiKey = () => {
    setFormData({
      ...formData,
      apiKeys: [...formData.apiKeys, ""],
    });
  };

  const handleApiKeyChange = (index, value) => {
    const newApiKeys = [...formData.apiKeys];
    newApiKeys[index] = value;
    setFormData({ ...formData, apiKeys: newApiKeys });
  };

  const handleRemoveApiKey = (index) => {
    const newApiKeys = formData.apiKeys.filter((_, i) => i !== index);
    setFormData({ ...formData, apiKeys: newApiKeys });
  };

  // Generate sample data for preview
  const handleGenerateSample = () => {
    if (!isValidJson) {
      toast.error("Please enter valid JSON");
      return;
    }

    try {
      const schema = JSON.parse(formData.schemaDefinition);
      const sample = generateSampleData(schema);
      setSampleData(sample);
      setShowSampleData(true);
    } catch (err) {
      toast.error("Failed to generate sample data");
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.path.trim()) {
      errors.path = "Endpoint path is required";
    } else if (!formData.path.startsWith("/")) {
      errors.path = "Path must start with a slash (/)";
    }

    if (formData.count < 1 || formData.count > 1000) {
      errors.count = "Count must be between 1 and 1000";
    }

    if (formData.delay < 0 || formData.delay > 10000) {
      errors.delay = "Delay must be between 0 and 10000ms";
    }

    if (!isValidJson) {
      errors.schemaDefinition = "Invalid JSON schema";
    }

    if (
      formData.requireAuth &&
      (!formData.apiKeys.length || formData.apiKeys.some((key) => !key.trim()))
    ) {
      errors.apiKeys = "At least one non-empty API key is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare endpoint data
      const endpointData = {
        ...formData,
        schemaDefinition: JSON.parse(formData.schemaDefinition),
        apiKeys: formData.requireAuth
          ? formData.apiKeys.filter((key) => key.trim())
          : [],
      };

      if (endpoint) {
        // Update existing endpoint
        await endpointsApi.updateEndpoint(
          projectId,
          endpoint._id,
          endpointData
        );
        toast.success("Endpoint updated successfully");
      } else {
        // Create new endpoint
        await endpointsApi.createEndpoint(projectId, endpointData);
        toast.success("Endpoint created successfully");
      }

      if (onSave) onSave();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        (endpoint ? "Failed to update endpoint" : "Failed to create endpoint");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation between steps
  const nextStep = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.path.trim()) {
        setValidationErrors({ path: "Endpoint path is required" });
        return;
      }
      if (!formData.path.startsWith("/")) {
        setValidationErrors({ path: "Path must start with a slash (/)" });
        return;
      }
    } else if (step === 2 && !isValidJson) {
      toast.error("Please enter valid JSON");
      return;
    }

    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicators */}
      <div className="flex mb-6">
        <div
          className={`flex-1 text-center pb-2 border-b-2 ${
            step === 1 ? "border-blue-500 text-blue-600" : "border-gray-200"
          }`}
        >
          Basic Configuration
        </div>
        <div
          className={`flex-1 text-center pb-2 border-b-2 ${
            step === 2 ? "border-blue-500 text-blue-600" : "border-gray-200"
          }`}
        >
          Data Schema
        </div>
        <div
          className={`flex-1 text-center pb-2 border-b-2 ${
            step === 3 ? "border-blue-500 text-blue-600" : "border-gray-200"
          }`}
        >
          Authentication
        </div>
      </div>

      {/* Step 1: Basic Configuration */}
      {step === 1 && (
        <div>
          <div className="form-group">
            <label className="form-label">HTTP Method</label>
            <div className="flex flex-wrap gap-2">
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
                <button
                  key={method}
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    formData.method === method
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => handleMethodSelect(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="path" className="form-label">
              Endpoint Path
            </label>
            <input
              type="text"
              id="path"
              name="path"
              value={formData.path}
              onChange={handleInputChange}
              className={`form-input ${
                validationErrors.path ? "border-red-500" : ""
              }`}
              placeholder="/api/resources"
              required
            />
            {validationErrors.path ? (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.path}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Example: /api/users, /products, etc.
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="count" className="form-label">
              Number of Items (for GET collections)
            </label>
            <input
              type="number"
              id="count"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              min="1"
              max="1000"
              className={`form-input ${
                validationErrors.count ? "border-red-500" : ""
              }`}
            />
            {validationErrors.count ? (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.count}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                How many items to generate (1-1000)
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="delay" className="form-label">
              Response Delay (ms)
            </label>
            <input
              type="number"
              id="delay"
              name="delay"
              value={formData.delay}
              onChange={handleInputChange}
              min="0"
              max="10000"
              className={`form-input ${
                validationErrors.delay ? "border-red-500" : ""
              }`}
            />
            {validationErrors.delay ? (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.delay}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Simulate network latency (0-10000ms)
              </p>
            )}
          </div>

          <div className="form-group">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="supportPagination"
                name="supportPagination"
                checked={formData.supportPagination}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="supportPagination"
                className="ml-2 block text-sm text-gray-700"
              >
                Support Pagination (skip & take parameters)
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500 ml-6">
              Only applies to GET collection endpoints
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Data Schema */}
      {step === 2 && (
        <div>
          <div className="form-group">
            <div className="flex justify-between items-center">
              <label className="form-label">Data Schema (JSON)</label>
              <button
                type="button"
                onClick={handleGenerateSample}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Preview Sample
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-2">
              Define the structure of your data using JSON. Use{" "}
              <code className="bg-gray-100 px-1 rounded">"(random:type)"</code>{" "}
              to generate random values. Static values will be preserved exactly
              as specified.
            </p>

            <div
              className={`border ${
                isValidJson ? "border-gray-300" : "border-red-500"
              } rounded-md overflow-hidden`}
            >
              <CodeMirror
                value={formData.schemaDefinition}
                height="300px"
                extensions={[json()]}
                onChange={handleSchemaChange}
                className="text-sm"
              />
            </div>

            {!isValidJson && (
              <p className="mt-2 text-sm text-red-500">
                Invalid JSON format. Please check your syntax.
              </p>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Available Random Types:
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <code className="bg-gray-100 px-1 rounded">
                  (random:string)
                </code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">
                  (random:number)
                </code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">
                  (random:boolean)
                </code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">(random:uuid)</code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">(random:date)</code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">
                  (random:datetime)
                </code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">(random:email)</code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">
                  (random:fullname)
                </code>
              </div>
              <div>
                <code className="bg-gray-100 px-1 rounded">(random:url)</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Authentication */}
      {step === 3 && (
        <div>
          <div className="form-group">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireAuth"
                name="requireAuth"
                checked={formData.requireAuth}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label
                htmlFor="requireAuth"
                className="ml-2 block text-sm text-gray-700"
              >
                Require API Key Authentication
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500 ml-6">
              Restrict access to this endpoint with Bearer token authentication
            </p>
          </div>

          {formData.requireAuth && (
            <div className="form-group">
              <label className="form-label">API Keys</label>

              {validationErrors.apiKeys && (
                <p className="mt-1 mb-2 text-sm text-red-600">
                  {validationErrors.apiKeys}
                </p>
              )}

              {formData.apiKeys.map((key, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => handleApiKeyChange(index, e.target.value)}
                    className="flex-1 form-input"
                    placeholder="Enter API key"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveApiKey(index)}
                    className="px-2 py-2 text-red-500 hover:text-red-700"
                    disabled={formData.apiKeys.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddApiKey}
                className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Add API Key
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="btn btn-secondary"
          >
            Back
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}

        {step < 3 ? (
          <button type="button" onClick={nextStep} className="btn btn-primary">
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-success"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {endpoint ? "Updating..." : "Creating..."}
              </>
            ) : endpoint ? (
              "Update Endpoint"
            ) : (
              "Create Endpoint"
            )}
          </button>
        )}
      </div>

      {/* Sample Data Preview Modal */}
      {showSampleData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Generated Data Preview</h3>
              <button
                onClick={() => setShowSampleData(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto max-h-[calc(80vh-8rem)]">
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowSampleData(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default EndpointForm;
