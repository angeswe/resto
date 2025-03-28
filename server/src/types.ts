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
  method: string;
  schemaDefinition: Schema;
  count: number;
  supportPagination: boolean;
  requireAuth: boolean;
  apiKeys: string[];
  delay: number;
  projectId: string;
  responseType: 'list' | 'single';
  parameterPath: string;
  responseHttpStatus: string;
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
    typeof obj.method === 'string' &&
    obj.schemaDefinition &&
    typeof obj.count === 'number' &&
    typeof obj.supportPagination === 'boolean' &&
    typeof obj.requireAuth === 'boolean' &&
    Array.isArray(obj.apiKeys) &&
    typeof obj.delay === 'number' &&
    typeof obj.projectId === 'string' &&
    (obj.responseType === 'list' || obj.responseType === 'single') &&
    typeof obj.parameterPath === 'string' &&
    typeof obj.responseHttpStatus === 'string';
}
