import { Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  endpoints: IEndpoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndpoint extends Document {
  path: string;
  method: string;
  response: any;
  projectId: string;
  schemaDefinition: any;
  count: number;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  responseType: 'list' | 'single';
  parameterPath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse extends Error {
  statusCode?: number;
}
