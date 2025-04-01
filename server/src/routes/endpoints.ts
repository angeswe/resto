import express, { Request, Response } from 'express';
import { Endpoint } from '../models/Endpoint';
import { IEndpoint } from '../types';
import mongoose, { Types } from 'mongoose';

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
 *         description: List of endpoints for the project
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
 *               - schemaDefinition
 *             properties:
 *               path:
 *                 type: string
 *                 description: Endpoint path (e.g., /users)
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *                 description: HTTP method
 *               schemaDefinition:
 *                 type: object
 *                 description: Schema definition
 *               responseType:
 *                 type: string
 *                 description: Response type
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
 */
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
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/projects/:projectId/endpoints/:endpointId', async (req: Request, res: Response) => {
  try {
    const { projectId, endpointId } = req.params;
    
    if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'The provided project ID or endpoint ID is not valid'
      });
    }

    const endpoint = await Endpoint.findOne({
      _id: new Types.ObjectId(endpointId),
      projectId: new Types.ObjectId(projectId)
    }).lean();

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
        ...endpoint,
        id: endpoint._id
      }
    });
  } catch (error) {
    console.error('Error getting endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
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
 *             properties:
 *               path:
 *                 type: string
 *                 description: Endpoint path
 *               method:
 *                 type: string
 *                 enum: [GET, POST, PUT, DELETE, PATCH]
 *                 description: HTTP method
 *               schemaDefinition:
 *                 type: object
 *                 description: Schema definition
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
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *       404:
 *         description: Endpoint not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/endpoints/:endpointId', async (req: Request, res: Response) => {
  try {
    const endpointId = req.params.endpointId;
    console.log('Update request received:', {
      endpointId,
      body: req.body,
      responseHttpStatus: req.body.responseHttpStatus
    });

    if (!Types.ObjectId.isValid(endpointId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Endpoint ID',
        message: 'The provided endpoint ID is not valid'
      });
    }

    const updateData = {
      ...req.body,
      path: req.body.path.startsWith('/') ? req.body.path : '/' + req.body.path
    };
    console.log('Update data:', updateData);

    const updatedEndpoint = await Endpoint.findByIdAndUpdate(
      endpointId,
      updateData,
      { 
        new: true,
        runValidators: true // Enable schema validation for update
      }
    ).lean() as IEndpoint;

    console.log('Updated endpoint:', updatedEndpoint);

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
