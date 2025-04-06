import mongoose, { Schema } from 'mongoose';
import { IEndpoint } from '../types';

const EndpointSchema = new Schema({
  path: {
    type: String,
    required: [true, 'Please add an endpoint path'],
    trim: true
  },
  method: {
    type: String,
    required: [true, 'Please add an HTTP method'],
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    uppercase: true
  },
  schemaDefinition: {
    type: Schema.Types.Mixed,
    required: [true, 'Please add a schema definition for data generation']
  },
  count: {
    type: Number,
    default: 10,
    min: 1,
    max: 10000
  },
  requireAuth: {
    type: Boolean,
    default: false
  },
  apiKeys: {
    type: [String],
    default: []
  },
  delay: {
    type: Number,
    default: 0,
    min: 0,
    max: 5000 // Maximum 5 seconds delay
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  responseType: {
    type: String,
    enum: ['list', 'single'],
    default: 'list'
  },
  parameterPath: {
    type: String,
    default: ':id'
  },
  responseHttpStatus: {
    type: String,
    default: '200'
  }
}, {
  timestamps: true
});

// Remove all indexes to start fresh
EndpointSchema.clearIndexes();

const Endpoint = mongoose.model<IEndpoint>('Endpoint', EndpointSchema);

export { Endpoint };
