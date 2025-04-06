import { useEffect, useState } from 'react';
import SchemaEditor from '../projects/SchemaEditor';
import { toast } from 'react-toastify';
import { Endpoint, EndpointData, EndpointMethod } from '../../types/project';
import { METHOD_STATUS_CODES } from '../../types/http';
import { Button, Input, Switch, Select, SelectItem } from '@heroui/react';

/**
 * HTTP status code interface
 */
interface HttpStatusCode {
  code: string;
  text: string;
  category: string;
}

/**
 * Status codes grouped by category
 */
interface StatusByCategory {
  [key: string]: HttpStatusCode[];
}

/**
 * Props for the EndpointForm component
 */
interface EndpointFormProps {
  onSubmit: (data: EndpointData) => Promise<void>;
  onCancel: () => void;
  initialData?: Endpoint | EndpointData;
  isSubmitting?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Form data for endpoint creation/editing
 */
interface EndpointFormData {
  path: string;
  method: EndpointMethod;
  schemaDefinition: string;
  count: number;
  //supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: 'object' | 'list';
  parameterPath: string;
  responseHttpStatus: string;
}

/**
 * Default schema for new endpoints
 */
const defaultSchema = {
  id: "(random:uuid)",
  name: "(random:name)",
  email: "(random:email)",
  createdAt: "(random:datetime)"
};

/**
 * Component for creating or editing endpoints
 */
const EndpointForm: React.FC<EndpointFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting: externalIsSubmitting = false,
  theme = 'dark'
}) => {
  const [formData, setFormData] = useState<EndpointFormData>({
    path: initialData?.path || '',
    method: initialData?.method || 'GET',
    schemaDefinition: typeof initialData?.schemaDefinition === 'string'
      ? initialData.schemaDefinition
      : JSON.stringify(initialData?.schemaDefinition || defaultSchema, null, 2),
    count: initialData?.count || 10,
    //supportPagination: initialData?.supportPagination || false,
    requireAuth: initialData?.requireAuth || false,
    apiKeys: initialData?.apiKeys || [],
    delay: initialData?.delay || 0,
    responseType: initialData?.responseType === 'list' ? 'list' : 'object',
    parameterPath: initialData?.parameterPath || '',
    responseHttpStatus: initialData?.responseHttpStatus || '200'
  });

  const [isValidJson, setIsValidJson] = useState(true);
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  // Use external isSubmitting state if provided, otherwise use internal state
  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  useEffect(() => {
    if (initialData) {
      setFormData({
        path: initialData.path || '',
        method: initialData.method || 'GET',
        schemaDefinition: typeof initialData.schemaDefinition === 'string'
          ? initialData.schemaDefinition
          : JSON.stringify(initialData.schemaDefinition || defaultSchema, null, 2),
        count: initialData.count || 10,
        //supportPagination: initialData.supportPagination || false,
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // Only set internal submitting state if external isn't provided
    if (!externalIsSubmitting) {
      setInternalIsSubmitting(true);
    }

    try {
      // Parse the schema string to an object before submitting
      let parsedSchema;
      try {
        parsedSchema = JSON.parse(formData.schemaDefinition);
      } catch (error) {
        parsedSchema = defaultSchema;
      }

      const endpointData: EndpointData = {
        ...formData,
        schemaDefinition: parsedSchema,
        responseType: formData.responseType === 'list' ? 'list' : 'object'
      };
      await onSubmit(endpointData);
    } catch (error) {
      console.error('Error submitting endpoint:', error);
      toast.error('Failed to save endpoint');
    } finally {
      // Only reset internal submitting state if external isn't provided
      if (!externalIsSubmitting) {
        setInternalIsSubmitting(false);
      }
    }
  };

  const statusCodes = (METHOD_STATUS_CODES[formData.method] as HttpStatusCode[]).reduce((acc: StatusByCategory, status: HttpStatusCode) => {
    if (!acc[status.category]) acc[status.category] = [];
    acc[status.category].push(status);
    return acc;
  }, {});

  // Prepare status code items for rendering
  const statusCodeCategories = Object.keys(statusCodes);

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
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Method</label>
        <Select
          aria-label="Select HTTP method"
          selectedKeys={[formData.method]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as EndpointMethod;
            if (selected) {
              handleSelectChange('method', selected);
            }
          }}
          isDisabled={isSubmitting}
        >
          <SelectItem key="GET">GET</SelectItem>
          <SelectItem key="POST">POST</SelectItem>
          <SelectItem key="PUT">PUT</SelectItem>
          <SelectItem key="DELETE">DELETE</SelectItem>
        </Select>
      </div>

      {formData.method === 'GET' && (
        <div className="space-y-2">
          <label htmlFor="responseType" className="block text-sm font-medium">
            Response Type
          </label>
          <Select
            aria-label="Select response type"
            selectedKeys={[formData.responseType]}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys)[0] as 'list' | 'object';
              if (selected) {
                handleSelectChange('responseType', selected);
              }
            }}
            isDisabled={isSubmitting}
          >
            <SelectItem key="list">List</SelectItem>
            <SelectItem key="object">Single Object</SelectItem>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="responseHttpStatus" className="block text-sm font-medium">
          Response HTTP Status
        </label>
        <Select
          aria-label="Select HTTP status code"
          selectedKeys={[formData.responseHttpStatus]}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            if (selected) {
              handleSelectChange('responseHttpStatus', selected);
            }
          }}
          isDisabled={isSubmitting}
        >
          {statusCodeCategories.flatMap(category => [
            <SelectItem key={category} textValue={category}>
              <div className="font-bold text-sm">{category}</div>
            </SelectItem>,
            ...statusCodes[category].map(status => (
              <SelectItem key={status.code} textValue={`${status.code} - ${status.text}`}>
                <div className="pl-2">{status.code} - {status.text}</div>
              </SelectItem>
            ))
          ])}
        </Select>
      </div>

      <div className="space-y-2">
        <SchemaEditor
          value={formData.schemaDefinition}
          onChange={handleSchemaChange}
          isValid={isValidJson}
          theme={theme}
        />
      </div>

      {formData.method === 'GET' && formData.responseType === 'list' && (
        <>
          <div className="space-y-2">
            <label htmlFor="count" className="block text-sm font-medium">
              Count
            </label>
            <Input
              type="number"
              id="count"
              name="count"
              value={formData.count.toString()}
              onChange={handleChange}
              min={1}
              max={100}
              disabled={isSubmitting}
            />
          </div>

          {/* <div className="space-y-2">
            <Switch
              isSelected={formData.supportPagination}
              onValueChange={(checked) => setFormData(prev => ({ ...prev, supportPagination: checked }))}
              aria-label="Support Pagination"
              isDisabled={isSubmitting}
            >
              Support Pagination
            </Switch>
          </div> */}
        </>
      )}

      <div className="space-y-2">
        <Switch
          isSelected={formData.requireAuth}
          onValueChange={(checked) => setFormData(prev => ({ ...prev, requireAuth: checked }))}
          aria-label="Require Authentication"
          isDisabled={isSubmitting}
        >
          Require Authentication
        </Switch>
      </div>

      {formData.requireAuth && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">API Keys</label>
          <div className="space-y-2">
            {formData.apiKeys.map((key, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="text"
                  value={key}
                  onChange={(e) => handleApiKeyChange(index, e.target.value)}
                  placeholder="API Key"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  onPress={() => handleRemoveApiKey(index)}
                  color="danger"
                  disabled={isSubmitting}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onPress={handleAddApiKey}
              disabled={isSubmitting}
            >
              Add API Key
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="delay" className="block text-sm font-medium">
          Response Delay (ms)
        </label>
        <Input
          type="number"
          id="delay"
          name="delay"
          value={formData.delay.toString()}
          onChange={handleChange}
          min={0}
          max={10000}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="parameterPath" className="block text-sm font-medium">
          Parameter Path (optional)
        </label>
        <Input
          type="text"
          id="parameterPath"
          name="parameterPath"
          value={formData.parameterPath}
          onChange={handleChange}
          placeholder="/api/users/:id"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          onPress={onCancel}
          variant="flat"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          isDisabled={!isValidJson || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Endpoint'}
        </Button>
      </div>
    </form>
  );
};

export default EndpointForm;
