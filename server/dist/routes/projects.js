"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRoutes = void 0;
const express_1 = require("express");
const projects_1 = require("../controllers/projects");
const router = (0, express_1.Router)();
router.route('/')
    .get(projects_1.getProjects)
    .post(projects_1.createProject);
router.route('/:id')
    .get(projects_1.getProject)
    .put(projects_1.updateProject)
    .delete(projects_1.deleteProject);
exports.projectRoutes = router;
