export interface IEndpoint {
  _id: string;
  path: string;
  method: string;
  schemaDefinition: Record<string, unknown>;
  count: number;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProject {
  _id: string;
  name: string;
  description: string;
  defaultSchema: Record<string, unknown>;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  createdAt: Date;
  updatedAt: Date;
}
