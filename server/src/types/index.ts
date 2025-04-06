import { Document } from 'mongoose';
import { Schema } from '../utils/dataGenerator';

export interface IProject extends Document {
  name: string;
  description: string;
  defaultSchema: Schema;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  endpoints: IEndpoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndpoint extends Document {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  schemaDefinition: Schema;
  count: number;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  projectId: string;
  responseType: 'list' | 'single';
  parameterPath: string;
  responseHttpStatus: string;
  description?: string;
  request?: any;
  response?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse extends Error {
  statusCode?: number;
}

export interface RequestWithEndpoint extends Request {
  endpoint?: IEndpoint;
}
