import { Document } from 'mongoose';
import { Request } from 'express';
import { Schema } from './utils/dataGenerator';

export interface IProject extends Document {
  name: string;
  description: string;
  defaultSchema: Schema;
  defaultCount: number;
  requireAuth: boolean;
  apiKeys: string[];
  createdAt: Date;
  updatedAt: Date;
  endpoints: IEndpoint[];
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

export interface RequestWithEndpoint extends Request {
  endpoint?: IEndpoint;
}

// Type guard for IEndpoint
export function isIEndpoint(obj: any): obj is IEndpoint {
  return obj &&
    typeof obj.path === 'string' &&
    (obj.method === 'GET' || obj.method === 'POST' || obj.method === 'PUT' || obj.method === 'DELETE' || obj.method === 'PATCH') &&
    obj.schemaDefinition &&
    typeof obj.count === 'number' &&
    typeof obj.requireAuth === 'boolean' &&
    Array.isArray(obj.apiKeys) &&
    typeof obj.delay === 'number' &&
    typeof obj.projectId === 'string' &&
    (obj.responseType === 'list' || obj.responseType === 'single') &&
    typeof obj.parameterPath === 'string' &&
    typeof obj.responseHttpStatus === 'string';
}
