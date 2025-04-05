import { Router, Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Endpoint } from '../models/Endpoint';
import { Types } from 'mongoose';
import ErrorResponse from '../utils/ErrorResponse';
import { IProject } from '../types';
import rateLimit from 'express-rate-limit';

const router = Router();

// Set up rate limiter: maximum of 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs,
});

// Format project data for response
const formatProject = (project: IProject) => ({
  id: project.id,
  name: project.name,
  description: project.description,
  defaultSchema: project.defaultSchema,
  defaultCount: project.defaultCount,
  requireAuth: project.requireAuth,
  apiKeys: project.apiKeys,
  endpoints: project.endpoints || [],
  createdAt: project.createdAt,
  updatedAt: project.updatedAt
});

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
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
 *                     $ref: '#/components/schemas/Project'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *               description:
 *                 type: string
 *                 description: Project description
 *               defaultSchema:
 *                 type: object
 *                 description: Default schema for data generation
 *               defaultCount:
 *                 type: integer
 *                 description: Default number of items to generate
 *               requireAuth:
 *                 type: boolean
 *                 description: Whether authentication is required
 *               apiKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of API keys
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid request
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
router.route('/')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate project ID if provided
      const projectId = req.params.projectId;
      if (projectId && !Types.ObjectId.isValid(projectId)) {
        throw new ErrorResponse('Invalid project ID format', 400);
      }

      const query = projectId ? { _id: projectId } : {};
      const projects = await Project.find(query).populate('endpoints');
      const formattedProjects = projects.map(formatProject);

      res.status(200).json({
        success: true,
        data: formattedProjects
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  })
  .post(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate required fields
      const requiredFields = ['name'];
      const missingFields = requiredFields.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));

      if (missingFields.length > 0) {
        throw new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      // Validate and sanitize input
      const projectData = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        defaultSchema: req.body.defaultSchema,
        defaultCount: req.body.defaultCount,
        requireAuth: req.body.requireAuth,
        apiKeys: req.body.apiKeys
      };

      // Validate schema definition if provided
      if (projectData.defaultSchema) {
        try {
          // If it's already an object, convert to string and back to validate
          const schema = typeof projectData.defaultSchema === 'string' 
            ? JSON.parse(projectData.defaultSchema)
            : projectData.defaultSchema;
          
          // Convert back to string for storage
          projectData.defaultSchema = JSON.stringify(schema);
        } catch (e) {
          throw new ErrorResponse('Invalid JSON in defaultSchema', 400);
        }
      }

      // Validate defaultCount if provided
      if (projectData.defaultCount !== undefined) {
        if (typeof projectData.defaultCount !== 'number' || projectData.defaultCount <= 0) {
          throw new ErrorResponse('defaultCount must be a positive number', 400);
        }
      }

      // Validate apiKeys if provided
      if (projectData.apiKeys) {
        if (!Array.isArray(projectData.apiKeys)) {
          throw new ErrorResponse('apiKeys must be an array', 400);
        }
        projectData.apiKeys = projectData.apiKeys
          .filter((key: any) => typeof key === 'string')
          .map((key: string) => key.trim());
      }

      const project = await Project.create(projectData);

      res.status(201).json({
        success: true,
        data: formatProject(project)
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       400:
 *         description: Invalid ID
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
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Project name
 *               description:
 *                 type: string
 *                 description: Project description
 *               defaultSchema:
 *                 type: object
 *                 description: Default schema for data generation
 *               defaultCount:
 *                 type: integer
 *                 description: Default number of items to generate
 *               requireAuth:
 *                 type: boolean
 *                 description: Whether authentication is required
 *               apiKeys:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of API keys
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Project'
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
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
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
 *                       description: Deleted project ID
 *       400:
 *         description: Invalid ID
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
router.route('/:id').all(limiter)
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.id;
      if (!projectId || !Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID'
        });
      }

      // Get project with populated endpoints
      const project = await Project.findOne({ _id: projectId }).populate('endpoints');
      if (!project) {
        throw new ErrorResponse(`Project not found with id of ${projectId}`, 404);
      }

      res.status(200).json({
        success: true,
        data: formatProject(project)
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  })
  .put(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate project ID
      const projectId = req.params.id;
      if (!Types.ObjectId.isValid(projectId)) {
        throw new ErrorResponse('Invalid project ID format', 400);
      }

      // Validate name format on raw input
      const name = req.body.name;
      if (name !== undefined) {
        if (typeof name !== 'string' || name.length < 1 || name.length > 100 || !/^[a-zA-Z0-9\s_-]+$/.test(name)) {
          throw new ErrorResponse('Invalid project name. Must be 1-100 characters long and contain only alphanumeric characters, spaces, underscores, and hyphens', 400);
        }
      }

      // Validate description length on raw input
      const description = req.body.description;
      if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 500) {
          throw new ErrorResponse('Description must not exceed 500 characters', 400);
        }
      }

      // Validate API keys on raw input
      const apiKeys = req.body.apiKeys;
      if (apiKeys !== undefined) {
        if (!Array.isArray(apiKeys)) {
          throw new ErrorResponse('API keys must be an array', 400);
        }
        // Validate each API key
        for (const key of apiKeys) {
          if (typeof key !== 'string' || key.length < 8 || key.length > 64 || !/^[a-zA-Z0-9_-]+$/.test(key)) {
            throw new ErrorResponse('Invalid API key format. Keys must be 8-64 characters long and contain only alphanumeric characters, underscores, and hyphens', 400);
          }
        }
      }

      // Validate defaultSchema on raw input
      const defaultSchema = req.body.defaultSchema;
      if (defaultSchema !== undefined) {
        if (typeof defaultSchema !== 'object' || defaultSchema === null) {
          throw new ErrorResponse('Invalid schema format. Must be a valid JSON object', 400);
        }
        try {
          // Ensure schema can be properly serialized
          JSON.stringify(defaultSchema);
        } catch (error) {
          throw new ErrorResponse('Invalid schema format', 400);
        }
      }

      // Validate defaultCount on raw input
      const defaultCount = req.body.defaultCount;
      if (defaultCount !== undefined) {
        if (typeof defaultCount !== 'number' || defaultCount < 1 || defaultCount > 10000) {
          throw new ErrorResponse('Default count must be between 1 and 10000', 400);
        }
      }

      // Validate and sanitize input
      const updateData: Partial<typeof Project.schema.obj> = {
        name: typeof req.body.name === 'string'
          ? req.body.name.trim()
          : undefined,
        description: typeof req.body.description === 'string'
          ? req.body.description.trim()
          : undefined,
        defaultSchema: typeof req.body.defaultSchema === 'object' && req.body.defaultSchema !== null
          ? req.body.defaultSchema
          : undefined,
        defaultCount: typeof req.body.defaultCount === 'number' && req.body.defaultCount >= 0
          ? Math.floor(req.body.defaultCount)
          : undefined,
        requireAuth: typeof req.body.requireAuth === 'boolean'
          ? Boolean(req.body.requireAuth)
          : undefined,
        apiKeys: Array.isArray(req.body.apiKeys)
          ? req.body.apiKeys.filter((key: unknown): key is string => typeof key === 'string').map((key: string) => key.trim())
          : undefined
      };

      // Remove undefined values
      for (const key of Object.keys(updateData) as Array<keyof typeof updateData>) {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      }

      // Validate all fields against schema
      const schemaFields = Object.keys(Project.schema.paths);
      const allowedFields = new Set(schemaFields);
      
      // Create sanitized data object with only allowed fields
      const sanitizedData: Record<string, unknown> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (allowedFields.has(key)) {
          sanitizedData[key] = value;
        }
      });

      // Ensure _id and __v cannot be modified
      delete sanitizedData._id;
      delete sanitizedData.__v;

      // Find project first to validate it exists
      const existingProject = await Project.findOne({ _id: projectId });
      if (!existingProject) {
        throw new ErrorResponse(`Project not found with id of ${projectId}`, 404);
      }

      // Update project with validated and sanitized data
      const project = await Project.findOneAndUpdate(
        { _id: projectId },
        { $set: sanitizedData },
        {
          new: true,
          runValidators: true
        }
      ).populate('endpoints');

      if (!project) {
        throw new ErrorResponse(`Project not found with id of ${projectId}`, 404);
      }

      res.status(200).json({
        success: true,
        data: formatProject(project)
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  })
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate project ID
      const projectId = req.params.id;
      if (!Types.ObjectId.isValid(projectId)) {
        throw new ErrorResponse('Invalid project ID format', 400);
      }

      const project = await Project.findOne({ _id: projectId });
      if (!project) {
        throw new ErrorResponse(`Project not found with id of ${projectId}`, 404);
      }

      // Delete associated endpoints
      await Endpoint.deleteMany({ projectId });

      // Delete the project
      await project.deleteOne();

      res.status(200).json({
        success: true,
        data: {
          id: projectId
        }
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });

export const projectRoutes = router;
