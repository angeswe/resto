"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProject = exports.getProjects = void 0;
const Project_1 = require("../models/Project");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
// Format project data for response
const formatProject = (project) => {
    console.log('Formatting project data:', project);
    const formatted = {
        id: project._id,
        name: project.name,
        description: project.description,
        defaultSchema: project.defaultSchema,
        defaultCount: project.defaultCount,
        requireAuth: project.requireAuth,
        apiKeys: project.apiKeys
    };
    console.log('Formatted project data:', formatted);
    return formatted;
};
// @desc    Get all projects
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
    try {
        const projects = await Project_1.Project.find().populate('endpoints');
        res.status(200).json({
            success: true,
            data: projects.map(formatProject)
        });
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
};
exports.getProjects = getProjects;
// @desc    Get single project
// @route   GET /api/projects/:id
const getProject = async (req, res, next) => {
    try {
        console.log('Fetching project with ID:', req.params.id);
        const project = await Project_1.Project.findById(req.params.id).populate('endpoints');
        if (!project) {
            throw new ErrorResponse_1.default(`Project not found with id of ${req.params.id}`, 404);
        }
        const formattedProject = formatProject(project);
        console.log('Formatted project:', formattedProject);
        res.status(200).json({
            success: true,
            data: formattedProject
        });
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
};
exports.getProject = getProject;
// @desc    Create new project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
    try {
        console.log('Creating project with body:', req.body);
        const project = await Project_1.Project.create(req.body);
        console.log('Created project in DB:', project);
        const formattedProject = formatProject(project);
        console.log('Sending formatted project:', formattedProject);
        res.status(201).json({
            success: true,
            data: formattedProject
        });
    }
    catch (error) {
        console.error('Error creating project:', error);
        next(error instanceof Error ? error : new Error(String(error)));
    }
};
exports.createProject = createProject;
// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
    try {
        const project = await Project_1.Project.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!project) {
            throw new ErrorResponse_1.default(`Project not found with id of ${req.params.id}`, 404);
        }
        res.status(200).json({
            success: true,
            data: formatProject(project)
        });
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
};
exports.updateProject = updateProject;
// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project_1.Project.findById(req.params.id);
        if (!project) {
            throw new ErrorResponse_1.default(`Project not found with id of ${req.params.id}`, 404);
        }
        await project.deleteOne();
        res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        next(error instanceof Error ? error : new Error(String(error)));
    }
};
exports.deleteProject = deleteProject;
