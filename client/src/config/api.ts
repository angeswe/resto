const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_URLS = {
  base: API_BASE_URL,
  api: `${API_BASE_URL}/api`,
  mock: `${API_BASE_URL}/mock`,
  docs: `${API_BASE_URL}/api-docs`,
  projects: `${API_BASE_URL}/api/projects`,
  getProjectEndpoints: (projectId: string) => `${API_BASE_URL}/api/projects/${projectId}/endpoints`,
  getEndpoint: (projectId: string, endpointId: string) => `${API_BASE_URL}/api/projects/${projectId}/endpoints/${endpointId}`,
  getMockUrl: (projectId: string, path: string) => `${API_BASE_URL}/mock/${projectId}${path}`,
};

export default API_URLS;
