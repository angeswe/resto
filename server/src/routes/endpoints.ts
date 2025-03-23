import express, { Request, Response } from 'express';
import { Endpoint } from '../models/Endpoint';
import { IEndpoint } from '../types';
import mongoose, { Types } from 'mongoose';

const router = express.Router();

// Debug route to list all endpoints
router.get('/debug', async (req: Request, res: Response) => {
  try {
    const endpoints = await Endpoint.find().lean();
    res.json({
      endpointCount: endpoints.length,
      endpoints: endpoints.map(ep => ({
        path: ep.path,
        method: ep.method,
        projectId: ep.projectId.toString(),
        id: ep._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error getting endpoints:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get all endpoints for a project
router.get('/projects/:projectId/endpoints', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Project ID',
        message: 'The provided project ID is not valid'
      });
    }

    const endpoints = await Endpoint.find({ projectId: new Types.ObjectId(projectId) }).lean();
    console.log('Found endpoints:', endpoints);
    res.json({
      success: true,
      data: endpoints.map(endpoint => ({
        ...endpoint,
        id: endpoint._id
      }))
    });
  } catch (err: any) {
    console.error('Error fetching endpoints:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

// Create a new endpoint
router.post('/projects/:projectId/endpoints', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.projectId;
    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Project ID',
        message: 'The provided project ID is not valid'
      });
    }

    console.log('Creating endpoint:', { projectId: req.params.projectId, body: req.body });
    
    // Validate required fields
    const { path, method, schemaDefinition, responseType } = req.body;
    if (!path || !method || !schemaDefinition) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields',
        details: {
          path: !path,
          method: !method,
          schemaDefinition: !schemaDefinition
        }
      });
    }

    // Format path and method
    const formattedPath = path.startsWith('/') ? path : '/' + path;
    const formattedMethod = method.toUpperCase();
    const formattedResponseType = responseType || 'list';

    // Debug: List all endpoints in the project
    console.log('Current endpoints in project:', await Endpoint.find({ projectId: new Types.ObjectId(projectId) }).lean());

    // Debug: List all endpoints in the database
    console.log('All endpoints in database:', await Endpoint.find({}).lean());

    // Check for existing endpoint with same path, method, and project
    const existingEndpoint = await Endpoint.findOne({
      projectId: new Types.ObjectId(projectId),
      path: formattedPath,
      method: formattedMethod,
      responseType: formattedResponseType
    });

    console.log('Existing endpoint check:', {
      query: {
        projectId: new Types.ObjectId(projectId),
        path: formattedPath,
        method: formattedMethod,
        responseType: formattedResponseType
      },
      result: existingEndpoint
    });

    if (existingEndpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint already exists',
        details: `An endpoint with path '${formattedPath}', method '${formattedMethod}', and response type '${formattedResponseType}' already exists in this project`
      });
    }

    // Create the endpoint with defaults
    const endpoint = new Endpoint({
      projectId: new Types.ObjectId(projectId),
      path: formattedPath,
      method: formattedMethod,
      schemaDefinition: schemaDefinition || {},
      count: req.body.count || 10,
      supportPagination: req.body.supportPagination || false,
      requireAuth: req.body.requireAuth || false,
      apiKeys: req.body.apiKeys || [],
      delay: req.body.delay || 0,
      responseType: formattedResponseType,
      parameterPath: req.body.parameterPath || ':id'
    });

    console.log('About to save endpoint:', endpoint.toObject());

    await endpoint.save();
    console.log('Endpoint saved successfully');
    console.log('Created endpoint:', {
      ...endpoint.toObject(),
      _id: endpoint._id.toString(),
      projectId: endpoint.projectId.toString()
    });
    
    res.status(201).json({
      success: true,
      data: {
        ...endpoint.toObject(),
        id: endpoint._id
      }
    });
  } catch (err: any) {
    console.error('Error creating endpoint:', err);
    console.error('Error details:', err.stack);
    if (err.code === 11000) {
      console.error('Duplicate key error:', err.keyValue);
    }
    res.status(500).json({ 
      success: false, 
      error: 'Server Error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

// Update an endpoint
router.put('/endpoints/:endpointId', async (req: Request, res: Response) => {
  try {
    const endpointId = req.params.endpointId;
    if (!Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Endpoint ID',
        message: 'The provided endpoint ID is not valid'
      });
    }

    const updatedEndpoint = await Endpoint.findByIdAndUpdate(
      endpointId,
      {
        ...req.body,
        path: req.body.path.startsWith('/') ? req.body.path : '/' + req.body.path
      },
      { new: true }
    ).lean() as IEndpoint;

    if (!updatedEndpoint) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Endpoint not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...updatedEndpoint,
        id: updatedEndpoint._id
      }
    });
  } catch (err: any) {
    console.error('Error updating endpoint:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

// Delete an endpoint
router.delete('/endpoints/:endpointId', async (req: Request, res: Response) => {
  try {
    const endpointId = req.params.endpointId;
    if (!Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Endpoint ID',
        message: 'The provided endpoint ID is not valid'
      });
    }

    const endpoint = await Endpoint.findByIdAndDelete(endpointId);
    if (!endpoint) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Endpoint not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...endpoint.toObject(),
        id: endpoint._id
      }
    });
  } catch (err: any) {
    console.error('Error deleting endpoint:', err);
    console.error('Error details:', err.stack);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

export default router;
