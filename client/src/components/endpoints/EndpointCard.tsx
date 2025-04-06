import React from 'react';
import { Link } from 'react-router-dom';
import { Endpoint } from '../../types/project';

/**
 * Props for the EndpointCard component
 */
interface EndpointCardProps {
  endpoint: Endpoint;
  projectId: string;
  onTest: (endpoint: Endpoint) => void;
  onEdit: (endpoint: Endpoint) => void;
  onDelete: (endpoint: Endpoint) => void;
  isDeleting?: boolean;
}

/**
 * Component for displaying an endpoint card with actions
 */
const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  projectId,
  onTest,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  return (
    <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
              }`}>
              {endpoint.method}
            </span>
            <h3 className="text-lg font-medium text-[var(--text-primary)]">
              <Link to={`/projects/${projectId}/endpoints/${endpoint.id}`} className="hover:text-[var(--accent-color)]">
                {endpoint.path}
              </Link>
            </h3>
          </div>
          <div className="mt-1 text-sm text-[var(--text-secondary)]">
            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
              {endpoint.responseHttpStatus || '200'}
            </span>
            {endpoint.method === 'GET' && (
              <span className="ml-2">
                Response Type: {endpoint.responseType}
              </span>
            )}
            {endpoint.requireAuth && (
              <span className="ml-2">• Requires Authentication</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onTest(endpoint)}
            className="px-3 py-1 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors duration-200"
            disabled={isDeleting}
          >
            Test
          </button>
          <button
            onClick={() => onEdit(endpoint)}
            className="px-3 py-1 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors duration-200"
            disabled={isDeleting}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(endpoint)}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EndpointCard;
