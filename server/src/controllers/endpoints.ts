import { Request, Response, NextFunction } from 'express';
import { Endpoint } from '../models/Endpoint';
import { Project } from '../models/Project';
import ErrorResponse from '../utils/ErrorResponse';

// @desc    Get all endpoints for a project
// @route   GET /api/endpoints/project/:projectId
export const getEndpoints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const endpoints = await Endpoint.find({ projectId: req.params.projectId });
    res.status(200).json({
      success: true,
      data: endpoints
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single endpoint
// @route   GET /api/endpoints/:id
export const getEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${req.params.id}`, 404);
    }
    res.status(200).json({
      success: true,
      data: endpoint
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new endpoint
// @route   POST /api/endpoints/project/:projectId
export const createEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    req.body.projectId = req.params.projectId;
    
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw new ErrorResponse(`Project not found with id of ${req.params.projectId}`, 404);
    }

    const endpoint = await Endpoint.create(req.body);
    
    res.status(201).json({
      success: true,
      data: endpoint
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update endpoint
// @route   PUT /api/endpoints/:id
export const updateEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${req.params.id}`, 404);
    }

    const updatedEndpoint = await Endpoint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedEndpoint
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete endpoint
// @route   DELETE /api/endpoints/:id
export const deleteEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const endpoint = await Endpoint.findById(req.params.id);
    if (!endpoint) {
      throw new ErrorResponse(`Endpoint not found with id of ${req.params.id}`, 404);
    }

    // Remove endpoint from project's endpoints array
    const project = await Project.findById(endpoint.projectId);
    if (project) {
      project.endpoints = project.endpoints.filter(
        (epId) => epId.toString() !== endpoint._id.toString()
      );
      await project.save();
    }

    await endpoint.deleteOne();
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};
