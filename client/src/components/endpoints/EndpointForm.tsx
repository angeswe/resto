import { useEffect, useState } from 'react';
import SchemaEditor from '../projects/SchemaEditor';
import { toast } from 'react-toastify';
import { Endpoint, EndpointData, EndpointMethod } from '../../types/project';
import { useAppContext } from '../../contexts/AppContext';
import { METHOD_STATUS_CODES } from '../../types/http';
import { Button, Input, Switch } from '@heroui/react';

interface HttpStatusCode {
  code: string;
  text: string;
  category: string;
}

interface StatusByCategory {
  [key: string]: HttpStatusCode[];
}

interface EndpointFormProps {
  projectId: string;
  onSubmit: (data: EndpointData) => Promise<void>;
  onCancel: () => void;
  initialData?: Endpoint | EndpointData;
}

interface EndpointFormData {
  path: string;
  method: EndpointMethod;
  schemaDefinition: string;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: 'object' | 'list';
  parameterPath: string;
  responseHttpStatus: string;
}

const defaultSchema = {
  id: "(random:uuid)",
  name: "(random:name)",
  email: "(random:email)",
  createdAt: "(random:datetime)"
};

const EndpointForm: React.FC<EndpointFormProps> = ({ projectId, onSubmit, onCancel, initialData }) => {
  console.log('Project ID:', projectId);
  const { theme } = useAppContext();
  const [formData, setFormData] = useState<EndpointFormData>({
    path: initialData?.path || '',
    method: initialData?.method || 'GET',
    schemaDefinition: typeof initialData?.schemaDefinition === 'string'
      ? initialData.schemaDefinition
      : JSON.stringify(initialData?.schemaDefinition || defaultSchema, null, 2),
    count: initialData?.count || 10,
    supportPagination: initialData?.supportPagination || false,
    requireAuth: initialData?.requireAuth || false,
    apiKeys: initialData?.apiKeys || [],
    delay: initialData?.delay || 0,
    responseType: initialData?.responseType === 'list' ? 'list' : 'object',
    parameterPath: initialData?.parameterPath || '',
    responseHttpStatus: initialData?.responseHttpStatus || '200'
  });

  const [isValidJson, setIsValidJson] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        path: initialData.path || '',
        method: initialData.method || 'GET',
        schemaDefinition: typeof initialData.schemaDefinition === 'string'
          ? initialData.schemaDefinition
          : JSON.stringify(initialData.schemaDefinition || defaultSchema, null, 2),
        count: initialData.count || 10,
        supportPagination: initialData.supportPagination || false,
        requireAuth: initialData.requireAuth || false,
        apiKeys: initialData.apiKeys || [],
        delay: initialData.delay || 0,
        responseType: initialData.responseType === 'list' ? 'list' : 'object',
        parameterPath: initialData.parameterPath || '',
        responseHttpStatus: initialData.responseHttpStatus || '200'
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSchemaChange = (value: string) => {
    try {
      // Validate that the value is valid JSON
      JSON.parse(value);
      setFormData(prev => ({
        ...prev,
        schemaDefinition: value
      }));
      setIsValidJson(true);
    } catch (e) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidJson) {
      toast.error('Please fix the JSON schema before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      // Always convert schema to string before submitting
      const endpointData: EndpointData = {
        ...formData,
        schemaDefinition: formData.schemaDefinition,
        responseType: formData.responseType === 'list' ? 'list' : 'object'
      };
      await onSubmit(endpointData);
    } catch (error) {
      console.error('Error submitting endpoint:', error);
      toast.error('Failed to save endpoint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusCodes = (METHOD_STATUS_CODES[formData.method] as HttpStatusCode[]).reduce((acc: StatusByCategory, status: HttpStatusCode) => {
    if (!acc[status.category]) acc[status.category] = [];
    acc[status.category].push(status);
    return acc;
  }, {});

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="path" className="block text-sm font-medium">
          Path
        </label>
        <Input
          type="text"
          id="path"
          name="path"
          value={formData.path}
          onChange={handleChange}
          placeholder="/api/users"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Method</label>
        <select
          name="method"
          value={formData.method}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-indigo-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {formData.method === 'GET' && (
        <div className="space-y-2">
          <label htmlFor="responseType" className="block text-sm font-medium">
            Response Type
          </label>
          <select
            id="responseType"
            name="responseType"
            value={formData.responseType}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-indigo-500"
          >
            <option value="list">List (Index)</option>
            <option value="object">Single Item</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="responseHttpStatus" className="block text-sm font-medium">
          Response HTTP Status
        </label>
        <select
          id="responseHttpStatus"
          name="responseHttpStatus"
          value={formData.responseHttpStatus}
          onChange={(e) => setFormData({ ...formData, responseHttpStatus: e.target.value })}
          className="w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(statusCodes).map(([category, codes]) => (
            <optgroup key={category} label={category.replace(/([A-Z])/g, ' $1').toLowerCase()}>
              {codes.map(status => (
                <option key={status.code} value={String(status.code)}>
                  {status.code} {status.text}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {formData.method === 'GET' && formData.responseType === 'object' && (
        <div className="space-y-2">
          <label htmlFor="parameterPath" className="block text-sm font-medium">
            Parameter Path
          </label>
          <input
            type="text"
            id="parameterPath"
            name="parameterPath"
            value={formData.parameterPath}
            onChange={handleChange}
            placeholder=":id"
            className="w-full px-3 py-2 rounded-md border focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-sm text-gray-500">
            This will be used to identify the item in the URL (e.g., /api/users/:id)
          </p>
        </div>
      )}

      {formData.method === 'GET' && formData.responseType === 'list' && (
        <>
          <div className="space-y-2">
            <label htmlFor="count" className="block text-sm font-medium">
              Default Count
            </label>
            <Input
              type="number"
              id="count"
              name="count"
              value={String(formData.count)}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="supportPagination"
              name="supportPagination"
              checked={formData.supportPagination}
              onChange={handleChange}
              disabled={true}
            />
            <label htmlFor="supportPagination" className="text-sm text-gray-500">
              Support Pagination (Coming soon)
            </label>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label htmlFor="delay" className="block text-sm font-medium">
          Response Delay (ms)
        </label>
        <Input
          type="number"
          id="delay"
          name="delay"
          value={String(formData.delay)}
          onChange={handleChange}
          min="0"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Schema Definition</h3>
        <SchemaEditor
          value={formData.schemaDefinition}
          onChange={handleSchemaChange}
          isValid={isValidJson}
          theme={theme}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="requireAuth"
            name="requireAuth"
            isSelected={formData.requireAuth}
            onChange={handleChange}
          />
          <label htmlFor="requireAuth" className="text-sm font-medium">
            Require Authentication
          </label>
        </div>

        {formData.requireAuth && (
          <div className="ml-6 space-y-4">
            {formData.apiKeys.map((key, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={key}
                  onChange={(e) => handleApiKeyChange(index, e.target.value)}
                  placeholder="API Key"
                />
                <Button
                  type="button"
                  onPress={() => handleRemoveApiKey(index)}
                  variant="flat"
                  color="danger"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onPress={handleAddApiKey}
              variant="flat"
            >
              Add Key
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="flat"
          onPress={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isValidJson}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
};

export default EndpointForm;
