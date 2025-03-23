"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEndpoint = exports.updateEndpoint = exports.createEndpoint = exports.getEndpoint = exports.getEndpoints = void 0;
const Endpoint_1 = require("../models/Endpoint");
const Project_1 = require("../models/Project");
const ErrorResponse_1 = __importDefault(require("../utils/ErrorResponse"));
// @desc    Get all endpoints for a project
// @route   GET /api/endpoints/project/:projectId
const getEndpoints = async (req, res, next) => {
    try {
        const endpoints = await Endpoint_1.Endpoint.find({ projectId: req.params.projectId });
        res.status(200).json({
            success: true,
            data: endpoints
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getEndpoints = getEndpoints;
// @desc    Get single endpoint
// @route   GET /api/endpoints/:id
const getEndpoint = async (req, res, next) => {
    try {
        const endpoint = await Endpoint_1.Endpoint.findById(req.params.id);
        if (!endpoint) {
            throw new ErrorResponse_1.default(`Endpoint not found with id of ${req.params.id}`, 404);
        }
        res.status(200).json({
            success: true,
            data: endpoint
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getEndpoint = getEndpoint;
// @desc    Create new endpoint
// @route   POST /api/endpoints/project/:projectId
const createEndpoint = async (req, res, next) => {
    try {
        req.body.projectId = req.params.projectId;
        const project = await Project_1.Project.findById(req.params.projectId);
        if (!project) {
            throw new ErrorResponse_1.default(`Project not found with id of ${req.params.projectId}`, 404);
        }
        const endpoint = await Endpoint_1.Endpoint.create(req.body);
        res.status(201).json({
            success: true,
            data: endpoint
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createEndpoint = createEndpoint;
// @desc    Update endpoint
// @route   PUT /api/endpoints/:id
const updateEndpoint = async (req, res, next) => {
    try {
        const endpoint = await Endpoint_1.Endpoint.findById(req.params.id);
        if (!endpoint) {
            throw new ErrorResponse_1.default(`Endpoint not found with id of ${req.params.id}`, 404);
        }
        const updatedEndpoint = await Endpoint_1.Endpoint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({
            success: true,
            data: updatedEndpoint
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateEndpoint = updateEndpoint;
// @desc    Delete endpoint
// @route   DELETE /api/endpoints/:id
const deleteEndpoint = async (req, res, next) => {
    try {
        const endpoint = await Endpoint_1.Endpoint.findById(req.params.id);
        if (!endpoint) {
            throw new ErrorResponse_1.default(`Endpoint not found with id of ${req.params.id}`, 404);
        }
        // Remove endpoint from project's endpoints array
        const project = await Project_1.Project.findById(endpoint.projectId);
        if (project) {
            project.endpoints = project.endpoints.filter((epId) => epId.toString() !== endpoint._id.toString());
            await project.save();
        }
        await endpoint.deleteOne();
        res.status(200).json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEndpoint = deleteEndpoint;
