import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/Project';
import ErrorResponse from '../utils/ErrorResponse';

// Format project data for response
const formatProject = (project: any) => {
  console.log('Formatting project data:', project);
  const formatted = {
    id: project._id,
    name: project.name,
    description: project.description,
    defaultSchema: project.defaultSchema,
    defaultCount: project.defaultCount,
    requireAuth: project.requireAuth,
    apiKeys: project.apiKeys,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
  console.log('Formatted project data:', formatted);
  return formatted;
};

// @desc    Get all projects
// @route   GET /api/projects
export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await Project.find().populate('endpoints');
    res.status(200).json({
      success: true,
      data: projects.map(formatProject)
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
export const getProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Fetching project with ID:', req.params.id);
    const project = await Project.findById(req.params.id).populate('endpoints');
    if (!project) {
      throw new ErrorResponse(`Project not found with id of ${req.params.id}`, 404);
    }
    const formattedProject = formatProject(project);
    console.log('Formatted project:', formattedProject);
    res.status(200).json({
      success: true,
      data: formattedProject
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

// @desc    Create new project
// @route   POST /api/projects
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Creating project with body:', req.body);
    const project = await Project.create(req.body);
    console.log('Created project in DB:', project);
    
    const formattedProject = formatProject(project);
    console.log('Sending formatted project:', formattedProject);
    
    res.status(201).json({
      success: true,
      data: formattedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    next(error instanceof Error ? error : new Error(String(error)));
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
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
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      throw new ErrorResponse(`Project not found with id of ${req.params.id}`, 404);
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error instanceof Error ? error : new Error(String(error)));
  }
};
