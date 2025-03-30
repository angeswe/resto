import { createContext, useContext, useState, useEffect, FC, ReactNode } from "react";
import { projectsApi } from "../utils/api";
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

  // Fetch all projects on initial load
  useEffect(() => {
    fetchProjects();
  }, []);

  // Function to fetch all projects
  const fetchProjects = async (): Promise<Project[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getProjects();
      console.log('Fetched projects:', data); // Debug log
      setProjects(data);
      return data;
    } catch (err: unknown) {
      const errorMessage = (err as any).response?.data?.error || "An error occurred while loading projects";
      setError(errorMessage);
      console.error("Error fetching projects:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new project
  const addProject = async (projectData: ProjectData): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await projectsApi.createProject(projectData);
      setProjects([...projects, newProject]);
      toast.success("Project created successfully");
      return newProject;
    } catch (err: unknown) {
      const errorMessage =
        (err as any).response?.data?.error || "Failed to create project";
      setError(errorMessage);
      toast.error(errorMessage);
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
      const updatedProject = await projectsApi.updateProject(projectId, projectData);
      setProjects(
        projects.map((p) => (p.id === projectId ? updatedProject : p))
      );
      toast.success("Project updated successfully");
      return updatedProject;
    } catch (err: unknown) {
      const errorMessage =
        (err as any).response?.data?.error || "Failed to update project";
      setError(errorMessage);
      toast.error(errorMessage);
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
      await projectsApi.deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      toast.success("Project deleted successfully");
    } catch (err: unknown) {
      const errorMessage =
        (err as any).response?.data?.error || "Failed to delete project";
      setError(errorMessage);
      toast.error(errorMessage);
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
