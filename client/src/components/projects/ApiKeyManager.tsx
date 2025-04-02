import React from 'react';
import { Input, Button } from '@heroui/react';
import { TrashIcon } from "@heroicons/react/24/outline";

interface ApiKeyManagerProps {
  apiKeys: string[];
  onApiKeyChange: (index: number, value: string) => void;
  onAddApiKey: () => void;
  onRemoveApiKey: (index: number) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  apiKeys,
  onApiKeyChange,
  onAddApiKey,
  onRemoveApiKey,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">API Keys</h3>
        <Button onClick={onAddApiKey} size="sm">Add Key</Button>
      </div>
      {apiKeys.map((key, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={key}
            onChange={(e) => onApiKeyChange(index, e.target.value)}
            placeholder="Enter API key"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-100"
            onClick={() => onRemoveApiKey(index)}
          >
            <TrashIcon className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ApiKeyManager;
