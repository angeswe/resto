export interface IEndpoint {
  _id: string;
  path: string;
  method: string;
  schemaDefinition: any;
  count: number;
  supportPagination: boolean;
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
  defaultSchema: any;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  createdAt: Date;
  updatedAt: Date;
}
