export interface Project {
  id: string;
  name: string;
  description: string;
  defaultSchema: string | Record<string, any>;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  createdAt: string;
  updatedAt: string;
  endpoints: Endpoint[];
}

export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type ResponseType = 'object' | 'list' | 'single';

export interface ProjectData {
  name: string;
  description: string;
  defaultSchema?: object;
  defaultCount?: number;
  requireAuth?: boolean;
  apiKeys?: string[];
}

export interface EndpointData {
  path: string;
  method: EndpointMethod;
  schemaDefinition: string | Record<string, any>;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: ResponseType;
  parameterPath: string;
  responseHttpStatus: string;
  description?: string;
  request?: any;
  response?: any;
}

export interface Endpoint extends EndpointData {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppContextType {
  projects: Project[];
  endpoints: Endpoint[];
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<Project[]>;
  getEndpoint: (endpointId: string, projectId: string) => Promise<Endpoint>;
  getEndpoints: (projectId: string) => Promise<Endpoint[]>;
  addProject: (projectData: ProjectData) => Promise<Project>;
  updateProject: (projectId: string, projectData: ProjectData) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  addEndpoint: (projectId: string, endpointData: any) => Promise<void>;
  updateEndpoint: (projectId: string, endpointId: string, endpointData: any) => Promise<void>;
  deleteEndpoint: (projectId: string, endpointId: string) => Promise<void>;
}
