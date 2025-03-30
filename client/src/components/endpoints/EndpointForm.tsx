import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { endpointsApi } from '../../utils/api';
import { EndpointData, Endpoint, EndpointMethod, ResponseType } from '../../types/project';
import { METHOD_STATUS_CODES } from '../../types/http';

interface EndpointFormProps {
  projectId: string;
  endpoint?: Endpoint;
  onClose?: () => void;
  onSuccess?: (formData: EndpointData) => void;
}

interface FormData {
  path: string;
  method: EndpointMethod;
  schemaDefinition: string;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: ResponseType;
  parameterPath: string;
  responseHttpStatus: string;
}

const defaultSchema = {
  id: "(random:uuid)",
  name: "(random:string)",
  createdAt: "(random:datetime)",
  email: "(random:email)"
};

const EndpointForm: React.FC<EndpointFormProps> = ({ projectId, endpoint, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    path: '',
    method: 'GET',
    schemaDefinition: JSON.stringify(defaultSchema, null, 2),
    count: 10,
    supportPagination: false,
    requireAuth: false,
    apiKeys: [''],
    delay: 0,
    responseType: 'list',
    parameterPath: ':id',
    responseHttpStatus: '200'
  });
  const [isValidJson, setIsValidJson] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!endpoint;

  useEffect(() => {
    if (endpoint) {
      setFormData({
        path: endpoint.path,
        method: endpoint.method,
        schemaDefinition: JSON.stringify(endpoint.schemaDefinition, null, 2),
        count: endpoint.count,
        supportPagination: endpoint.supportPagination,
        requireAuth: endpoint.requireAuth,
        apiKeys: endpoint.apiKeys.length > 0 ? endpoint.apiKeys : [''],
        delay: endpoint.delay,
        responseType: endpoint.responseType,
        parameterPath: endpoint.parameterPath,
        responseHttpStatus: endpoint.responseHttpStatus
      });
    }
  }, [endpoint]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) {
      console.log('Form is already submitting, preventing double submission');
      return;
    }

    setIsSubmitting(true);

    try {
      let parsedSchema: Record<string, any>;
      try {
        parsedSchema = JSON.parse(formData.schemaDefinition);
      } catch {
        toast.error('Invalid JSON schema');
        setIsSubmitting(false);
        return;
      }
      const endpointData: EndpointData = {
        path: formData.path,
        method: formData.method.toUpperCase() as EndpointMethod,
        schemaDefinition: parsedSchema,
        count: formData.count,
        supportPagination: formData.supportPagination,
        requireAuth: formData.requireAuth,
        apiKeys: formData.apiKeys.filter(key => key.trim()),
        delay: formData.delay,
        responseType: formData.responseType,
        parameterPath: formData.parameterPath,
        responseHttpStatus: formData.responseHttpStatus
      };

      console.log('Submitting endpoint:', endpointData);

      if (endpoint) {
        await endpointsApi.updateEndpoint(endpoint.id, endpointData);
        toast.success('Endpoint updated successfully');
        onSuccess?.(endpointData);
      } else {
        const created = await endpointsApi.createEndpoint(projectId, endpointData);
        console.log('Created endpoint:', created);
        toast.success('Endpoint created successfully');
        onSuccess?.(endpointData);
      }
      onClose?.();
    } catch (error: any) {
      console.error('Error saving endpoint:', error);
      toast.error(error.response?.data?.details || error.message || 'Failed to save endpoint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJsonChange = (value: string) => {
    setFormData(prev => ({ ...prev, schemaDefinition: value }));
    try {
      JSON.parse(value);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const handleAddApiKey = () => {
    setFormData(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, '']
    }));
  };

  const handleRemoveApiKey = (index: number) => {
    setFormData(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter((_, i) => i !== index)
    }));
  };

  const handleApiKeyChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.map((key, i) => (i === index ? value : key))
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="path" className="block text-sm font-medium text-gray-700">
          Path
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="path"
            id="path"
            value={formData.path}
            onChange={handleChange}
            className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
            placeholder="/api/users"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Method</label>
        <select
          name="method"
          value={formData.method}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {formData.method === 'GET' && (
        <div>
          <label htmlFor="responseType" className="block text-sm font-medium text-gray-700">
            Response Type
          </label>
          <select
            id="responseType"
            name="responseType"
            value={formData.responseType}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="list">List (Index)</option>
            <option value="single">Single Item</option>
          </select>
        </div>
      )}
      <div>
        <label htmlFor="responseHttpStatus" className="block text-sm font-medium text-gray-700">
          Response HTTP Status
        </label>
        <select
          className="form-select"
          value={formData.responseHttpStatus}
          onChange={(e) => setFormData({ ...formData, responseHttpStatus: e.target.value })}
        >
          {Object.entries(
            METHOD_STATUS_CODES[formData.method].reduce((acc, status) => {
              if (!acc[status.category]) acc[status.category] = [];
              acc[status.category].push(status);
              return acc;
            }, {} as Record<string, typeof METHOD_STATUS_CODES[keyof typeof METHOD_STATUS_CODES]>)
          ).map(([category, codes]) => (
            <optgroup key={category} label={category.replace(/([A-Z])/g, ' $1').toLowerCase()}>
              {codes.map(status => (
                <option key={status.code} value={status.code}>
                  {status.code} {status.text}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {formData.method === 'GET' && formData.responseType === 'single' && (
        <div>
          <label htmlFor="parameterPath" className="block text-sm font-medium text-gray-700">
            Parameter Path
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="parameterPath"
              id="parameterPath"
              value={formData.parameterPath}
              onChange={handleChange}
              className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              placeholder=":id"
            />
            <p className="mt-1 text-sm text-gray-500">
              This will be used to identify the item in the URL (e.g., /api/users/:id)
            </p>
          </div>
        </div>
      )}

      {formData.method === 'GET' && formData.responseType === 'list' && (
        <>
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700">
              Default Count
            </label>
            <div className="mt-1">
              <input
                type="number"
                name="count"
                id="count"
                value={formData.count}
                onChange={handleChange}
                min="1"
                className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="supportPagination"
              checked={formData.supportPagination}
              onChange={handleChange}
              disabled={true}
              title="Pagination is a feature for the future"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">Support Pagination</label>
          </div>
        </>
      )}

      <div>
        <label htmlFor="delay" className="block text-sm font-medium text-gray-700">
          Response Delay (ms)
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="delay"
            id="delay"
            value={formData.delay}
            onChange={handleChange}
            min="0"
            className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="schema" className="block text-sm font-medium text-gray-700">
          Schema Definition
        </label>
        <div className="mt-1">
          <CodeMirror
            value={formData.schemaDefinition}
            height="200px"
            extensions={[json()]}
            onChange={handleJsonChange}
            className={`border rounded-md ${!isValidJson ? 'border-red-500' : 'border-gray-300'}`}
          />
          {!isValidJson && (
            <p className="mt-2 text-sm text-red-500">Invalid JSON format</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="requireAuth"
            checked={formData.requireAuth}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">Require Authentication</label>
        </div>

        {formData.requireAuth && (
          <div className="ml-6 space-y-2">
            {formData.apiKeys.map((key, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => handleApiKeyChange(index, e.target.value)}
                  placeholder="API Key"
                  className="block w-full rounded-md border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveApiKey(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddApiKey}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Add Key
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg
            className="mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {isEditing ? (
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            ) : (
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
          {isSubmitting ? "Saving..." : (isEditing ? "Update Endpoint" : "Create Endpoint")}
        </button>
      </div>
    </form>
  );
};

export default EndpointForm;
