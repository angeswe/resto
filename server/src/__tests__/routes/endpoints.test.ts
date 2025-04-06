import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Endpoint } from '../../models/Endpoint';
import { endpointRoutes } from '../../routes/endpoints';
import supertest from 'supertest';
import express from 'express';

// Import test setup
import '../setup';
import { IEndpoint } from '@/types';

// Create a test app with the endpoint routes
const app = express();
app.use(express.json());
app.use('/api', endpointRoutes);

// Mock the Endpoint model
vi.mock('../../models/Endpoint', () => ({
  Endpoint: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
    schema: {
      paths: {
        path: {},
        method: {},
        projectId: {},
        response: {},
        schemaDefinition: {},
        count: {},
        requireAuth: {},
        apiKeys: {},
        delay: {},
        responseType: {},
        parameterPath: {},
        responseHttpStatus: {}
      }
    }
  }
}));

// Mock the Project model
vi.mock('../../models/Project', () => ({
  Project: {
    findById: vi.fn(),
    findOne: vi.fn()
  }
}));

describe('Endpoint Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /projects/:projectId/endpoints', () => {
    it('should return 400 for invalid project ID', async () => {
      const response = await supertest(app)
        .get('/api/projects/invalid-id/endpoints');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid project ID');
    });

    it('should return endpoints for a valid project ID', async () => {
      const mockEndpoints = [
        {
          _id: new Types.ObjectId(),
          path: '/users',
          method: 'GET',
          projectId: new Types.ObjectId(),
          response: '{}',
          schemaDefinition: '{}',
          count: 10,
          requireAuth: false,
          apiKeys: [],
          delay: 0,
          responseType: 'list',
          parameterPath: '',
          responseHttpStatus: 200,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Mock the find method to return our mock endpoints
      vi.mocked(Endpoint.find).mockResolvedValue(mockEndpoints);

      const response = await supertest(app)
        .get(`/api/projects/${new Types.ObjectId().toString()}/endpoints`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].path).toBe('/users');
    });
  });

  describe('POST /projects/:projectId/endpoints', () => {
    it('should return 400 for invalid project ID', async () => {
      const response = await supertest(app)
        .post('/api/projects/invalid-id/endpoints')
        .send({
          path: '/test',
          method: 'GET'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid project ID');
    });

    it('should create an endpoint with valid data', async () => {
      const projectId = new Types.ObjectId().toString();
      const mockEndpoint = {
        _id: new Types.ObjectId(),
        path: '/test',
        method: 'GET',
        projectId,
        response: '{}',
        schemaDefinition: '{}',
        count: 10,
        requireAuth: false,
        apiKeys: [],
        delay: 0,
        responseType: 'list',
        parameterPath: '',
        responseHttpStatus: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock the create method to return our mock endpoint
      vi.mocked(Endpoint.create).mockResolvedValue([mockEndpoint] as any);

      const response = await supertest(app)
        .post(`/api/projects/${projectId}/endpoints`)
        .send({
          path: '/test',
          method: 'GET'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      // The endpoint is returned as the first item in an array
      expect(Array.isArray(response.body.data)).toBe(true);
      // Compare only the relevant fields, ignoring date formats
      expect(response.body.data[0]).toMatchObject({
        path: '/test',
        method: 'GET',
        projectId
      });
      expect(Endpoint.create).toHaveBeenCalledWith(expect.objectContaining({
        path: '/test',
        method: 'GET',
        projectId
      }));
    });

    it('should return 400 if required fields are missing', async () => {
      const projectId = new Types.ObjectId().toString();

      const response = await supertest(app)
        .post(`/api/projects/${projectId}/endpoints`)
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /projects/:projectId/endpoints/:endpointId', () => {
    it('should return 400 for invalid project ID', async () => {
      const endpointId = new Types.ObjectId().toString();

      const response = await supertest(app)
        .get(`/api/projects/invalid-id/endpoints/${endpointId}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid project ID');
    });

    it('should return 400 for invalid endpoint ID', async () => {
      const projectId = new Types.ObjectId().toString();

      const response = await supertest(app)
        .get(`/api/projects/${projectId}/endpoints/invalid-id`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid endpoint ID');
    });

    it('should return 404 if endpoint not found', async () => {
      const projectId = new Types.ObjectId().toString();
      const endpointId = new Types.ObjectId().toString();

      // Mock findOne to return null (not found)
      vi.mocked(Endpoint.findOne).mockResolvedValue(null);

      const response = await supertest(app)
        .get(`/api/projects/${projectId}/endpoints/${endpointId}`);

      expect(response.status).toBe(404);
    });

    it('should return endpoint for valid IDs', async () => {
      const projectId = new Types.ObjectId().toString();
      const endpointId = new Types.ObjectId().toString();

      const mockEndpoint = {
        _id: new Types.ObjectId(endpointId),
        path: '/test',
        method: 'GET',
        projectId: new Types.ObjectId(projectId),
        response: '{}',
        schemaDefinition: '{}',
        count: 10,
        requireAuth: false,
        apiKeys: [],
        delay: 0,
        responseType: 'list',
        parameterPath: '',
        responseHttpStatus: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock findOne to return our mock endpoint
      vi.mocked(Endpoint.findOne).mockResolvedValue(mockEndpoint);

      const response = await supertest(app)
        .get(`/api/projects/${projectId}/endpoints/${endpointId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Compare only the relevant fields, ignoring date formats
      expect(response.body.data).toMatchObject({
        _id: endpointId,
        path: '/test',
        method: 'GET',
        projectId,
        response: '{}',
        schemaDefinition: '{}'
      });
    });
  });

  describe('PUT /endpoints/:endpointId', () => {
    it('should return 400 for invalid endpoint ID', async () => {
      const response = await supertest(app)
        .put('/api/endpoints/invalid-id')
        .send({
          path: '/updated',
          method: 'GET'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid endpoint ID');
    });

    it('should return 400 if required fields are missing', async () => {
      const endpointId = new Types.ObjectId().toString();

      const response = await supertest(app)
        .put(`/api/endpoints/${endpointId}`)
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 if endpoint not found', async () => {
      const endpointId = new Types.ObjectId().toString();

      // Mock findOne to return null (not found)
      vi.mocked(Endpoint.findOne).mockResolvedValue(null);

      const response = await supertest(app)
        .put(`/api/endpoints/${endpointId}`)
        .send({
          path: '/updated',
          method: 'GET'
        });

      expect(response.status).toBe(404);
    });

    it('should update endpoint with valid data', async () => {
      const endpointId = new Types.ObjectId().toString();

      const mockEndpoint = {
        _id: new Types.ObjectId(endpointId),
        path: '/test',
        method: 'GET',
        projectId: new Types.ObjectId(),
        response: '{}',
        schemaDefinition: '{}',
        count: 10,
        requireAuth: false,
        apiKeys: [],
        delay: 0,
        responseType: 'list',
        parameterPath: '',
        responseHttpStatus: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedEndpoint = {
        ...mockEndpoint,
        path: '/updated',
        method: 'POST'
      };

      // Mock findOne to return our mock endpoint
      vi.mocked(Endpoint.findOne).mockResolvedValue(mockEndpoint);

      // Mock findOneAndUpdate to return the updated endpoint
      vi.mocked(Endpoint.findOneAndUpdate).mockResolvedValue(updatedEndpoint);

      const response = await supertest(app)
        .put(`/api/endpoints/${endpointId}`)
        .send({
          path: '/updated',
          method: 'POST'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Compare only the relevant fields, ignoring date formats
      expect(response.body.data).toMatchObject({
        _id: endpointId,
        path: '/updated',
        method: 'POST',
        projectId: updatedEndpoint.projectId.toString()
      });
      expect(Endpoint.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: endpointId },
        {
          $set: expect.objectContaining({
            path: '/updated',
            method: 'POST'
          })
        },
        expect.objectContaining({
          new: true,
          runValidators: true
        })
      );
    });
  });

  describe('DELETE /endpoints/:endpointId', () => {
    it('should return 400 for invalid endpoint ID', async () => {
      const response = await supertest(app)
        .delete('/api/endpoints/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid endpoint ID');
    });

    it('should return 404 if endpoint not found', async () => {
      const endpointId = new Types.ObjectId().toString();

      // Mock findOne to return null (not found)
      vi.mocked(Endpoint.findOne).mockResolvedValue(null);

      const response = await supertest(app)
        .delete(`/api/endpoints/${endpointId}`);

      expect(response.status).toBe(404);
    });

    it('should delete endpoint with valid ID', async () => {
      const endpointId = new Types.ObjectId().toString();

      const mockEndpoint = {
        _id: new Types.ObjectId(endpointId),
        path: '/test',
        method: 'GET',
        projectId: new Types.ObjectId(),
        response: '{}',
        schemaDefinition: '{}',
        count: 10,
        requireAuth: false,
        apiKeys: [],
        delay: 0,
        responseType: 'list',
        parameterPath: '',
        responseHttpStatus: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock findOne to return our mock endpoint
      vi.mocked(Endpoint.findOne).mockResolvedValue(mockEndpoint);

      // Mock deleteOne to return success
      vi.mocked(Endpoint.deleteOne).mockResolvedValue({ deletedCount: 1 } as any);

      const response = await supertest(app)
        .delete(`/api/endpoints/${endpointId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Endpoint.deleteOne).toHaveBeenCalledWith({ _id: endpointId });
    });
  });
});
