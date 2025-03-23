// client/src/utils/api.js
import axios from "axios";

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Projects API
export const projectsApi = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await api.get("/projects");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single project by ID
  getProject: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData) => {
    try {
      const response = await api.post("/projects", projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update a project
  updateProject: async (projectId, projectData) => {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId) => {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Endpoints API
export const endpointsApi = {
  // Get all endpoints for a project
  getEndpoints: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/endpoints`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single endpoint
  getEndpoint: async (projectId, endpointId) => {
    try {
      const response = await api.get(
        `/projects/${projectId}/endpoints/${endpointId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new endpoint
  createEndpoint: async (projectId, endpointData) => {
    try {
      const response = await api.post(
        `/projects/${projectId}/endpoints`,
        endpointData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update an endpoint
  updateEndpoint: async (projectId, endpointId, endpointData) => {
    try {
      const response = await api.put(
        `/projects/${projectId}/endpoints/${endpointId}`,
        endpointData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete an endpoint
  deleteEndpoint: async (projectId, endpointId) => {
    try {
      const response = await api.delete(
        `/projects/${projectId}/endpoints/${endpointId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Mock API utility to make requests to the generated endpoints
export const mockApi = {
  // Make a request to a mock endpoint
  request: async (
    projectId,
    path,
    method = "GET",
    data = null,
    headers = {}
  ) => {
    try {
      const config = {
        method,
        url: `/mock/${projectId}${path}`,
        headers,
      };

      if (data && ["POST", "PUT", "PATCH"].includes(method)) {
        config.data = data;
      }

      const response = await api(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
