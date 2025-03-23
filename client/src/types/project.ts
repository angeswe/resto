export interface Project {
  id: string;
  name: string;
  description: string;
  defaultSchema: object;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ResponseType = 'list' | 'single';

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
  schemaDefinition: Record<string, any>;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: ResponseType;
  parameterPath: string;
}

export interface Endpoint extends EndpointData {
  id: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (data: ProjectData) => Promise<Project>;
  updateProject: (id: string, data: ProjectData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<Project[]>;
}
