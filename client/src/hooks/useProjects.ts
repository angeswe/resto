import { useCallback, useState, useEffect } from 'react';
import { projectsApi } from '../utils/api';
import { toast } from 'react-toastify';
import { Project, ProjectData } from '../types/project';

export const useProjects = (): {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<Project[]>;
  addProject: (projectData: ProjectData) => Promise<Project>;
  updateProject: (projectId: string, projectData: ProjectData) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
} => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const addProject = useCallback(async (projectData: ProjectData): Promise<Project> => {
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
  }, [projectsApi, setLoading, setError]);

  const updateProject = useCallback(async (projectId: string, projectData: ProjectData): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, ...projectData } : project
      ));

      const updatedProject = await projectsApi.updateProject(projectId, projectData);
      setProjects(prev => prev.map(project =>
        project.id === projectId ? updatedProject : project
      ));

      toast.success("Project updated successfully");
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      toast.error(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectsApi, setLoading, setError]);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      setProjects(prev => prev.filter(project => project.id !== projectId));

      await projectsApi.deleteProject(projectId);
      toast.success("Project deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      toast.error(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectsApi, setLoading, setError]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
};
