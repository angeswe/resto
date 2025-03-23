import { Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  endpoints: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEndpoint extends Document {
  path: string;
  method: string;
  response: any;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorResponse extends Error {
  statusCode?: number;
}
