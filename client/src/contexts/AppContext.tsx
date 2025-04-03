import { createContext, useContext, useState, useEffect, useCallback, FC, ReactNode } from "react";
import { projectsApi } from "../utils/api";
import { endpointsApi } from "../utils/api"; // Import the endpointsApi module
import { toast } from "react-toastify";
import { AppContextType, Project, ProjectData } from "../types/project";

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

// Context provider component
export const AppContextProvider: FC<AppContextProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Sync with system theme on mount
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Function to fetch all projects
  const fetchProjects = useCallback(async (): Promise<Project[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProjects();
      setProjects(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectsApi, setProjects, setLoading, setError]);

  // Fetch all projects on initial load
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Add a new project
  const addProject = async (projectData: ProjectData): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectsApi.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      toast.success("Project created successfully");
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project');
      toast.error(err instanceof Error ? err.message : 'Failed to add project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a project
  const updateProject = async (projectId: string, projectData: ProjectData): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update: update local state first
      setProjects(prev => prev.map(project => 
        project.id === projectId ? { ...project, ...projectData } : project
      ));

      const updatedProject = await projectsApi.updateProject(projectId, projectData);
      // Update with the actual response
      setProjects(prev => prev.map(project => 
        project.id === projectId ? updatedProject : project
      ));
      
      toast.success("Project updated successfully");
      return updatedProject;
    } catch (err) {
      // If update fails, revert to previous state
      setError(err instanceof Error ? err.message : 'Failed to update project');
      toast.error(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update: remove from local state first
      setProjects(prev => prev.filter(project => project.id !== projectId));

      // Only show success toast after successful deletion
      await projectsApi.deleteProject(projectId);
      toast.success("Project deleted successfully");
    } catch (err) {
      // If deletion fails, revert to previous state
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      toast.error(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a new endpoint to a project
  const addEndpoint = async (projectId: string, endpointData: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update: add endpoint to local state first
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              endpoints: [...(project.endpoints || []), endpointData]
            } 
          : project
      ));

      const response = await endpointsApi.createEndpoint(projectId, endpointData);
      
      // Update with the actual endpoint data from the server
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              endpoints: [...(project.endpoints || []), response]
            } 
          : project
      ));

      toast.success("Endpoint added successfully");
    } catch (err) {
      // If addition fails, revert to previous state
      setError(err instanceof Error ? err.message : 'Failed to add endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to add endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an endpoint in a project
  const updateEndpoint = async (projectId: string, endpointId: string, endpointData: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update: update endpoint in local state first
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              endpoints: project.endpoints?.map(endpoint => 
                endpoint.id === endpointId ? { ...endpoint, ...endpointData } : endpoint
              ) || []
            }
          : project
      ));

      const response = await endpointsApi.updateEndpoint(endpointId, endpointData);
      
      // Update with the actual endpoint data from the server
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              endpoints: project.endpoints?.map(endpoint => 
                endpoint.id === endpointId ? { ...endpoint, ...response } : endpoint
              ) || []
            }
          : project
      ));

      toast.success("Endpoint updated successfully");
    } catch (err) {
      // If update fails, revert to previous state
      setError(err instanceof Error ? err.message : 'Failed to update endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to update endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an endpoint from a project
  const deleteEndpoint = async (projectId: string, endpointId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update: remove endpoint from local state first
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              endpoints: project.endpoints?.filter(endpoint => endpoint.id !== endpointId) || []
            }
          : project
      ));

      await endpointsApi.deleteEndpoint(endpointId);
      toast.success("Endpoint deleted successfully");
    } catch (err) {
      // If deletion fails, revert to previous state
      setError(err instanceof Error ? err.message : 'Failed to delete endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to delete endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        loading,
        error,
        theme,
        setTheme,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        addEndpoint,
        updateEndpoint,
        deleteEndpoint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export default AppContext;
