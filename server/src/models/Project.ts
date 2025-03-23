import mongoose, { Schema } from 'mongoose';
import { IProject } from '../types';

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  defaultSchema: {
    type: Schema.Types.Mixed,
    default: {
      id: "(random:uuid)",
      name: "(random:name)",
      email: "(random:email)",
      createdAt: "(random:datetime)"
    }
  },
  defaultCount: {
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
  endpoints: [{
    type: Schema.Types.ObjectId,
    ref: 'Endpoint'
  }]
}, {
  timestamps: true
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
