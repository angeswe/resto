import { SchemaDefinition } from './schema';

export interface Project {
  id: string;
  name: string;
  description: string;
  defaultSchema: SchemaDefinition;
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
  defaultSchema?: SchemaDefinition;
  defaultCount?: number;
  requireAuth?: boolean;
  apiKeys?: string[];
}

export interface EndpointData {
  path: string;
  method: EndpointMethod;
  schemaDefinition: SchemaDefinition;
  count: number;
  //supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: ResponseType;
  parameterPath: string;
  responseHttpStatus: string;
  description?: string;
  request?: Record<string, unknown>;
  response?: Record<string, unknown>;
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
  addEndpoint: (projectId: string, endpointData: EndpointData) => Promise<void>;
  updateEndpoint: (projectId: string, endpointId: string, endpointData: EndpointData) => Promise<void>;
  deleteEndpoint: (projectId: string, endpointId: string) => Promise<void>;
}
