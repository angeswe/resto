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
    const updateData = {
      path: req.body.path.startsWith('/') ? req.body.path : '/' + req.body.path,
      method: req.body.method,
      response: req.body.response,
      schemaDefinition: req.body.schemaDefinition,
      count: req.body.count,
      supportPagination: req.body.supportPagination,
      requireAuth: req.body.requireAuth,
      apiKeys: req.body.apiKeys,
      delay: req.body.delay,
      responseType: req.body.responseType,
      parameterPath: req.body.parameterPath
    };

    // Validate schema definition if provided
    if (updateData.schemaDefinition !== undefined) {
      // Validate that the schema is an object
      if (typeof updateData.schemaDefinition !== 'object' || updateData.schemaDefinition === null) {
        throw new ErrorResponse('schemaDefinition must be a valid JSON object', 400);
      }

      // Convert to string for storage
      updateData.schemaDefinition = JSON.stringify(updateData.schemaDefinition);
    }

    // Validate response if provided
    if (updateData.response !== undefined) {
      // Validate that the response is an object
      if (typeof updateData.response !== 'object' || updateData.response === null) {
        throw new ErrorResponse('response must be a valid JSON object', 400);
      }

      // Convert to string for storage
      updateData.response = JSON.stringify(updateData.response);
    }

    // Validate numeric fields
    if (updateData.count !== undefined) {
      if (typeof updateData.count !== 'number' || updateData.count <= 0) {
        throw new ErrorResponse('count must be a positive number', 400);
      }
    }

    if (updateData.delay !== undefined) {
      if (typeof updateData.delay !== 'number' || updateData.delay < 0) {
        throw new ErrorResponse('delay must be a non-negative number', 400);
      }
    }

    // Validate apiKeys if provided
    if (updateData.apiKeys !== undefined) {
      if (!Array.isArray(updateData.apiKeys)) {
        throw new ErrorResponse('apiKeys must be an array', 400);
      }
      updateData.apiKeys = updateData.apiKeys
        .filter((key: any) => typeof key === 'string')
        .map((key: string) => key.trim());
    }

    // Update endpoint
    const endpoint = await Endpoint.findByIdAndUpdate(
      endpointId,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${endpointId}`, 400);
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
