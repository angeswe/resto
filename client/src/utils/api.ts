import axios, { AxiosInstance, AxiosResponse } from "axios";
import { Project, ProjectData, Endpoint } from "../types/project";
import { API_URLS } from '../config/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URLS.api,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Projects API
export const projectsApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Project[]>> = await api.get("/projects");
      console.log('API Response:', response.data); // Debug log
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a single project by ID
  getProject: async (projectId: string): Promise<Project> => {
    try {
      console.log('API: Fetching project with ID:', projectId); // Debug log
      const response: AxiosResponse<ApiResponse<Project>> = await api.get(`/projects/${projectId}`);
      console.log('API: Received response:', response.data); // Debug log
      if (!response.data.success || !response.data.data) {
        throw new Error('Failed to fetch project data');
      }
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Create a new project
  createProject: async (projectData: ProjectData): Promise<Project> => {
    try {
      console.log('API: Creating project with data:', projectData);
      const response: AxiosResponse<ApiResponse<Project>> = await api.post('/projects', projectData);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Update a project
  updateProject: async (projectId: string, projectData: ProjectData): Promise<Project> => {
    try {
      console.log('API: Updating project with ID:', projectId);
      const response: AxiosResponse<ApiResponse<Project>> = await api.put(`/projects/${projectId}`, projectData);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Delete a project
  deleteProject: async (projectId: string): Promise<void> => {
    try {
      console.log('API: Deleting project with ID:', projectId);
      await api.delete(`/projects/${projectId}`);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

// Endpoints API
export const endpointsApi = {
  // Get all endpoints for a project
  getEndpoints: async (projectId: string): Promise<Endpoint[]> => {
    try {
      const response: AxiosResponse<ApiResponse<Endpoint[]>> = await api.get(`/projects/${projectId}/endpoints`);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Get a single endpoint
  getEndpoint: async (endpointId: string, projectId: string): Promise<Endpoint> => {
    try {
      const response: AxiosResponse<ApiResponse<Endpoint>> = await api.get(`/projects/${projectId}/endpoints/${endpointId}`);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Create a new endpoint
  createEndpoint: async (projectId: string, endpointData: any): Promise<Endpoint> => {
    try {
      const response: AxiosResponse<ApiResponse<Endpoint>> = await api.post(`/projects/${projectId}/endpoints`, endpointData);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Update an endpoint
  updateEndpoint: async (endpointId: string, endpointData: any): Promise<Endpoint> => {
    try {
      const response: AxiosResponse<ApiResponse<Endpoint>> = await api.put(`/endpoints/${endpointId}`, endpointData);
      return response.data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Delete an endpoint
  deleteEndpoint: async (endpointId: string): Promise<void> => {
    try {
      await api.delete(`/endpoints/${endpointId}`);
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
};

// Mock API utility to make requests to the generated endpoints
export const mockApi = {
  // Make a request to a mock endpoint
  request: async (
    projectId: string,
    path: string,
    { method = "GET", data = null, headers = {} }: { method?: string; data?: any; headers?: Record<string, string> } = {}
  ): Promise<any> => {
    try {
      const response = await api.request({
        method,
        url: `/mock/${projectId}${path.startsWith('/') ? path : '/' + path}`,
        data,
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Mock API request failed:', error);
      throw error;
    }
  }
};

export default api;
