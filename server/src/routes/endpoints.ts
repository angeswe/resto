import express, { Request, Response, NextFunction } from 'express';
import { Endpoint } from '../models/Endpoint';
import { Types } from 'mongoose';
import ErrorResponse from '../utils/ErrorResponse';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs,
});

router.get('/debug', limiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only allow access in development mode
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        error: 'Debug endpoint is only available in development mode'
      });
    }

    // Validate project ID
    const projectId = req.params.projectId;
    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Debug access requires valid project ID'
      });
    }

    // Only show endpoints for this project
    const endpoints = await Endpoint.find({ projectId }).lean();

    res.json({
      endpointCount: endpoints.length,
      endpoints
    });
  } catch (error) {
    console.error('Error getting endpoints:', error);
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

router.get('/projects/:projectId/endpoints', limiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId || !Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }

    const endpoints = await Endpoint.find({ projectId });
    res.status(200).json({
      success: true,
      data: endpoints.map(ep => ({
        id: ep._id.toString(),
        path: ep.path,
        method: ep.method,
        projectId: ep.projectId.toString(),
        response: ep.response,
        schemaDefinition: ep.schemaDefinition,
        count: ep.count,
        requireAuth: ep.requireAuth,
        apiKeys: ep.apiKeys,
        delay: ep.delay,
        responseType: ep.responseType,
        parameterPath: ep.parameterPath,
        responseHttpStatus: ep.responseHttpStatus,
        createdAt: ep.createdAt,
        updatedAt: ep.updatedAt
      }))
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

router.post('/projects/:projectId/endpoints', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }

    // Validate required fields
    const requiredFields = ['path', 'method'];
    const missingFields = requiredFields.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));

    if (missingFields.length > 0) {
      throw new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate path starts with /
    const path = req.body.path.startsWith('/') ? req.body.path : '/' + req.body.path;

    // Create endpoint
    const endpoint = await Endpoint.create({
      path,
      method: req.body.method,
      projectId,
      response: req.body.response || '{}',
      schemaDefinition: req.body.schemaDefinition || '{}',
      count: req.body.count || 10,
      requireAuth: req.body.requireAuth || false,
      apiKeys: req.body.apiKeys || [],
      delay: req.body.delay || 0,
      responseType: req.body.responseType || 'list',
      parameterPath: req.body.parameterPath || ''
    });

    res.status(201).json({
      success: true,
      data: endpoint
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

router.get('/projects/:projectId/endpoints/:endpointId', limiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, endpointId } = req.params;

    if (!Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }
    if (!Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endpoint ID'
      });
    }

    const endpoint = await Endpoint.findOne({ _id: endpointId, projectId });
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${endpointId}`, 404);
    }

    res.status(200).json({
      success: true,
      data: endpoint
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

router.put('/endpoints/:endpointId', limiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpointId = req.params.endpointId;
    if (!endpointId || !Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endpoint ID'
      });
    }

    // Validate required fields
    const requiredFields = ['path', 'method'];
    const missingFields = requiredFields.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));

    if (missingFields.length > 0) {
      throw new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }

    // Validate and sanitize input
    const updateData: Partial<typeof Endpoint.schema.obj> = {
      path: typeof req.body.path === 'string'
        ? (req.body.path.startsWith('/') ? req.body.path : '/' + req.body.path).trim()
        : undefined,
      method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(req.body.method?.toUpperCase())
        ? req.body.method.toUpperCase()
        : undefined,
      response: typeof req.body.response === 'object' && req.body.response !== null
        ? req.body.response
        : undefined,
      schemaDefinition: req.body.schemaDefinition !== undefined
        ? typeof req.body.schemaDefinition === 'string'
          ? req.body.schemaDefinition // Keep string as is
          : JSON.stringify(req.body.schemaDefinition) // Convert object to string
        : undefined,
      count: typeof req.body.count === 'number' && req.body.count >= 0
        ? Math.floor(req.body.count)
        : undefined,
      requireAuth: typeof req.body.requireAuth === 'boolean'
        ? Boolean(req.body.requireAuth)
        : undefined,
      apiKeys: Array.isArray(req.body.apiKeys)
        ? req.body.apiKeys.filter((key: unknown): key is string => typeof key === 'string').map((key: string) => key.trim())
        : undefined,
      delay: typeof req.body.delay === 'number' && req.body.delay >= 0
        ? Math.min(Math.floor(req.body.delay), 10000) // Cap delay at 10 seconds
        : undefined,
      responseType: ['list', 'single'].includes(req.body.responseType)
        ? req.body.responseType as 'list' | 'single'
        : undefined,
      parameterPath: typeof req.body.parameterPath === 'string'
        ? req.body.parameterPath.trim()
        : undefined
    };

    // Validate parameter path if provided
    const parameterPath = req.body.parameterPath;
    if (parameterPath !== undefined && parameterPath !== null && parameterPath !== '') {
      const paramPathRegex = /^[a-zA-Z0-9\-_/:]*$/;
      if (!paramPathRegex.test(parameterPath)) {
        throw new ErrorResponse('Invalid parameter path format. Must contain only alphanumeric characters, hyphens, underscores, forward slashes, and colons', 400);
      }
    }

    // Remove undefined values
    for (const key of Object.keys(updateData) as Array<keyof typeof updateData>) {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    }

    // Validate all fields against schema
    const schemaFields = Object.keys(Endpoint.schema.paths);
    const allowedFields = new Set(schemaFields);

    // Remove any fields that aren't in the schema
    const sanitizedData: Record<string, unknown> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (allowedFields.has(key)) {
        sanitizedData[key] = value;
      }
    });

    // Ensure _id and __v cannot be modified
    delete sanitizedData._id;
    delete sanitizedData.__v;

    // Find endpoint first to validate it exists
    const endpoint = await Endpoint.findOne({ _id: endpointId });
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${endpointId}`, 404);
    }

    // Update endpoint with validated and sanitized data
    const updatedEndpoint = await Endpoint.findOneAndUpdate(
      { _id: endpointId },  // endpointId is already validated as ObjectId
      { $set: sanitizedData },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedEndpoint
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

router.delete('/endpoints/:endpointId', limiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpointId = req.params.endpointId;
    if (!endpointId || !Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endpoint ID'
      });
    }

    // Find endpoint first to validate it exists
    const endpoint = await Endpoint.findOne({ _id: endpointId });
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${endpointId}`, 404);
    }

    // Delete the endpoint
    await Endpoint.deleteOne({ _id: endpointId });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

export const endpointRoutes = router;
