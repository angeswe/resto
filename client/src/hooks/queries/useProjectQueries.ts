import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../utils/api';
import { Project, ProjectData } from '../../types/project';
import { toast } from 'react-toastify';

/**
 * Type-safe query keys for projects
 */
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

/**
 * Hook for fetching all projects
 * @returns Query result with projects data, loading state, and error state
 */
export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getProjects,
  });
};

/**
 * Hook for fetching a single project by ID
 * @param projectId - The ID of the project to fetch
 * @returns Query result with project data, loading state, and error state
 */
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectsApi.getProject(projectId),
    enabled: !!projectId,
  });
};

/**
 * Hook for creating a new project
 * @returns Mutation result with create function and status
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: ProjectData) => projectsApi.createProject(projectData),
    onSuccess: (newProject: Project) => {
      // Invalidate projects list query to refetch
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // Optimistically update the projects list
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (oldData = []) => 
        [...oldData, newProject]
      );
      
      toast.success("Project created successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create project');
    },
  });
};

/**
 * Hook for updating a project
 * @param projectId - The ID of the project to update
 * @returns Mutation result with update function and status
 */
export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectData: ProjectData) => projectsApi.updateProject(projectId, projectData),
    onMutate: async (newProjectData: ProjectData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      
      // Snapshot the previous value
      const previousProject = queryClient.getQueryData<Project>(projectKeys.detail(projectId));
      const previousProjects = queryClient.getQueryData<Project[]>(projectKeys.lists());
      
      // Optimistically update to the new value
      if (previousProject) {
        queryClient.setQueryData<Project>(
          projectKeys.detail(projectId),
          { ...previousProject, ...newProjectData }
        );
      }
      
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          projectKeys.lists(),
          previousProjects.map(project => 
            project.id === projectId ? { ...project, ...newProjectData } : project
          )
        );
      }
      
      return { previousProject, previousProjects };
    },
    onSuccess: (updatedProject: Project) => {
      // Update the individual project data
      queryClient.setQueryData(projectKeys.detail(projectId), updatedProject);
      
      // Update the project in the list
      queryClient.setQueryData<Project[]>(projectKeys.lists(), (oldData = []) => 
        oldData.map(project => project.id === projectId ? updatedProject : project)
      );
      
      toast.success("Project updated successfully");
    },
    onError: (error: unknown, _variables: ProjectData, context: { previousProject?: Project; previousProjects?: Project[] } | undefined) => {
      // Rollback to the previous value if available
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), context.previousProject);
      }
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    },
    onSettled: () => {
      // Always refetch after error or success to synchronize with server state
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};

/**
 * Hook for deleting a project
 * @returns Mutation result with delete function and status
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.deleteProject(projectId),
    onMutate: async (deletedProjectId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: projectKeys.lists() });
      
      // Snapshot the previous value
      const previousProjects = queryClient.getQueryData<Project[]>(projectKeys.lists());
      
      // Optimistically remove the project from the list
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          projectKeys.lists(),
          previousProjects.filter(project => project.id !== deletedProjectId)
        );
      }
      
      return { previousProjects };
    },
    onSuccess: () => {
      toast.success("Project deleted successfully");
    },
    onError: (error: unknown, _variables: string, context: { previousProjects?: Project[] } | undefined) => {
      // Rollback to the previous value if available
      if (context?.previousProjects) {
        queryClient.setQueryData(projectKeys.lists(), context.previousProjects);
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    },
    onSettled: () => {
      // Always refetch after error or success to synchronize with server state
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
};
