import express, { Request, Response, NextFunction } from 'express';
import { Endpoint } from '../models/Endpoint';
import { Project } from '../models/Project';
import { Types } from 'mongoose';
import ErrorResponse from '../utils/ErrorResponse';

const router = express.Router();

/**
 * @swagger
 * /api/debug:
 *   get:
 *     summary: Debug route to list all endpoints (Development only)
 *     tags: [Debug]
 *     responses:
 *       200:
 *         description: List of all endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 endpointCount:
 *                   type: integer
 *                   description: Total number of endpoints
 *                 endpoints:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                       method:
 *                         type: string
 *                       projectId:
 *                         type: string
 *                       id:
 *                         type: string
 */
router.get('/debug', async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @swagger
 * /api/projects/{projectId}/endpoints:
 *   get:
 *     summary: Get all endpoints for a project
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of endpoints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid project ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects/:projectId/endpoints', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    if (!Types.ObjectId.isValid(projectId)) {
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
        supportPagination: ep.supportPagination,
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

/**
 * @swagger
 * /api/projects/{projectId}/endpoints:
 *   post:
 *     summary: Create a new endpoint for a project
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - method
 *             properties:
 *               path:
 *                 type: string
 *                 description: Endpoint path
 *               method:
 *                 type: string
 *                 description: HTTP method (GET, POST, PUT, DELETE)
 *               response:
 *                 type: string
 *                 description: Response data
 *               schemaDefinition:
 *                 type: object
 *                 description: Schema definition for data generation
 *               count:
 *                 type: integer
 *                 description: Number of items to generate
 *               supportPagination:
 *                 type: boolean
 *                 description: Whether to support pagination
 *               requireAuth:
 *                 type: boolean
 *                 description: Whether authentication is required
 *               apiKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of API keys
 *               delay:
 *                 type: integer
 *                 description: Response delay in milliseconds
 *               responseType:
 *                 type: string
 *                 enum: [list, single]
 *                 description: Response type (list or single item)
 *               parameterPath:
 *                 type: string
 *                 description: Path for pagination parameter
 *     responses:
 *       201:
 *         description: Endpoint created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
      supportPagination: req.body.supportPagination || false,
      requireAuth: req.body.requireAuth || false,
      apiKeys: req.body.apiKeys || [],
      delay: req.body.delay || 0,
      responseType: req.body.responseType || 'list',
      parameterPath: req.body.parameterPath || 'page'
    });

    res.status(201).json({
      success: true,
      data: endpoint
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

/**
 * @swagger
 * /api/projects/{projectId}/endpoints/{endpointId}:
 *   get:
 *     summary: Get an endpoint by ID
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: endpointId
 *         required: true
 *         schema:
 *           type: string
 *         description: Endpoint ID
 *     responses:
 *       200:
 *         description: Endpoint details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects/:projectId/endpoints/:endpointId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, endpointId } = req.params;

    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }

    const endpoint = await Endpoint.findById(endpointId);
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

/**
 * @swagger
 * /api/endpoints/{endpointId}:
 *   put:
 *     summary: Update an endpoint
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: endpointId
 *         required: true
 *         schema:
 *           type: string
 *         description: Endpoint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - method
 *             properties:
 *               path:
 *                 type: string
 *                 description: Endpoint path
 *               method:
 *                 type: string
 *                 description: HTTP method (GET, POST, PUT, DELETE)
 *               response:
 *                 type: string
 *                 description: Response data
 *               schemaDefinition:
 *                 type: object
 *                 description: Schema definition for data generation
 *               count:
 *                 type: integer
 *                 description: Number of items to generate
 *               supportPagination:
 *                 type: boolean
 *                 description: Whether to support pagination
 *               requireAuth:
 *                 type: boolean
 *                 description: Whether authentication is required
 *               apiKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of API keys
 *               delay:
 *                 type: integer
 *                 description: Response delay in milliseconds
 *               responseType:
 *                 type: string
 *                 enum: [list, single]
 *                 description: Response type (list or single item)
 *               parameterPath:
 *                 type: string
 *                 description: Path for pagination parameter
 *     responses:
 *       200:
 *         description: Endpoint updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Endpoint'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/endpoints/:endpointId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpointId = req.params.endpointId;
    if (!Types.ObjectId.isValid(endpointId)) {
      throw new ErrorResponse('Invalid endpoint ID format', 400);
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
      supportPagination: typeof req.body.supportPagination === 'boolean'
        ? Boolean(req.body.supportPagination)
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
      const paramPathRegex = /^[a-zA-Z0-9\-_\/:]*$/;
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

    // Update endpoint with validated and sanitized data
    const endpoint = await Endpoint.findOneAndUpdate(
      { _id: endpointId },
      { $set: sanitizedData },
      {
        new: true,
        runValidators: true
      }
    );

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

/**
 * @swagger
 * /api/endpoints/{endpointId}:
 *   delete:
 *     summary: Delete an endpoint
 *     tags: [Endpoints]
 *     parameters:
 *       - in: path
 *         name: endpointId
 *         required: true
 *         schema:
 *           type: string
 *         description: Endpoint ID
 *     responses:
 *       200:
 *         description: Endpoint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Deleted endpoint ID
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/endpoints/:endpointId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const endpointId = req.params.endpointId;
    if (!Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endpoint ID'
      });
    }

    const endpoint = await Endpoint.findById(endpointId);
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${endpointId}`, 404);
    }

    await endpoint.deleteOne();

    res.status(200).json({
      success: true,
      data: {
        id: endpointId
      }
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
});

export const endpointRoutes = router;
