import { Router, Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import { Endpoint } from '../models/Endpoint';
import { Types } from 'mongoose';
import ErrorResponse from '../utils/ErrorResponse';
import { IProject } from '../types';

const router = Router();

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
      const projects = await Project.find().populate('endpoints');
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

      const project = await Project.create({
        name: req.body.name,
        description: req.body.description,
        defaultSchema: req.body.defaultSchema,
        defaultCount: req.body.defaultCount,
        requireAuth: req.body.requireAuth,
        apiKeys: req.body.apiKeys
      });

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
router.route('/:id')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await Project.findById(req.params.id).populate('endpoints');
      if (!project) {
        throw new ErrorResponse(`Project not found with id of ${req.params.id}`, 404);
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
      // Validate required fields
      const requiredFields = ['name'];
      const missingFields = requiredFields.filter(field => !Object.prototype.hasOwnProperty.call(req.body, field));

      if (missingFields.length > 0) {
        throw new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400);
      }

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          description: req.body.description,
          defaultSchema: req.body.defaultSchema,
          defaultCount: req.body.defaultCount,
          requireAuth: req.body.requireAuth,
          apiKeys: req.body.apiKeys
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!project) {
        throw new ErrorResponse(`Project not found with id of ${req.params.id}`, 404);
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
      const project = await Project.findById(req.params.id);
      if (!project) {
        throw new ErrorResponse(`Project not found with id of ${req.params.id}`, 404);
      }

      // Delete associated endpoints
      await Endpoint.deleteMany({ projectId: req.params.id });

      // Delete the project
      await project.deleteOne();

      res.status(200).json({
        success: true,
        data: {
          id: req.params.id
        }
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });

export const projectRoutes = router;
