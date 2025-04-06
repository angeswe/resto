import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Project, ProjectData, Endpoint, EndpointData } from "../types/project";
import { ApiResponse, MockRequestOptions } from "../types/api";
import { API_URLS } from '../config/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URLS.api,
  headers: {
    "Content-Type": "application/json",
  },
});

// Projects API
export const projectsApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    const response: AxiosResponse<ApiResponse<Project[]>> = await api.get("/projects");
    return response.data.data;
  },

  // Get a single project by ID
  getProject: async (projectId: string): Promise<Project> => {
    const response: AxiosResponse<ApiResponse<Project>> = await api.get(`/projects/${projectId}`);
    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to fetch project data');
    }
    return response.data.data;
  },

  // Create a new project
  createProject: async (projectData: ProjectData): Promise<Project> => {
    const response: AxiosResponse<ApiResponse<Project>> = await api.post('/projects', projectData);
    return response.data.data;
  },

  // Update a project
  updateProject: async (projectId: string, projectData: ProjectData): Promise<Project> => {
    const response: AxiosResponse<ApiResponse<Project>> = await api.put(`/projects/${projectId}`, projectData);
    return response.data.data;
  },

  // Delete a project
  deleteProject: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
};

// Endpoints API
export const endpointsApi = {
  // Get all endpoints for a project
  getEndpoints: async (projectId: string): Promise<Endpoint[]> => {
    const response: AxiosResponse<ApiResponse<Endpoint[]>> = await api.get(`/projects/${projectId}/endpoints`);
    return response.data.data;
  },

  // Get a single endpoint
  getEndpoint: async (endpointId: string, projectId: string): Promise<Endpoint> => {
    const response: AxiosResponse<ApiResponse<Endpoint>> = await api.get(`/projects/${projectId}/endpoints/${endpointId}`);
    return response.data.data;
  },

  // Create a new endpoint
  createEndpoint: async (projectId: string, endpointData: EndpointData): Promise<Endpoint> => {
    const response: AxiosResponse<ApiResponse<Endpoint>> = await api.post(`/projects/${projectId}/endpoints`, endpointData);
    return response.data.data;
  },

  // Update an endpoint
  updateEndpoint: async (endpointId: string, endpointData: EndpointData): Promise<Endpoint> => {
    const response: AxiosResponse<ApiResponse<Endpoint>> = await api.put(`/endpoints/${endpointId}`, endpointData);
    return response.data.data;
  },

  // Delete an endpoint
  deleteEndpoint: async (endpointId: string): Promise<void> => {
    await api.delete(`/endpoints/${endpointId}`);
  },
};

// Mock API utility to make requests to the generated endpoints
export const mockApi = {
  // Make a request to a mock endpoint
  request: async <TResponse = unknown>(
    projectId: string,
    path: string,
    options: MockRequestOptions = {}
  ): Promise<TResponse> => {
    const { method = "GET", data = null, headers = {} } = options;
    const response = await api.request<ApiResponse<TResponse>>({
      method,
      url: `/mock/${projectId}${path.startsWith('/') ? path : '/' + path}`,
      data,
      headers
    });
    return response.data.data;
  }
};

export default api;
