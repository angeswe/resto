import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpointsApi, mockApi } from '../../utils/api';
import { Endpoint, EndpointData } from '../../types/project';
import { toast } from 'react-toastify';
import { MockRequestOptions } from '../../types/api';

/**
 * Type-safe query keys for endpoints
 */
export const endpointKeys = {
  all: ['endpoints'] as const,
  lists: () => [...endpointKeys.all, 'list'] as const,
  list: (projectId: string) => [...endpointKeys.lists(), { projectId }] as const,
  details: () => [...endpointKeys.all, 'detail'] as const,
  detail: (endpointId: string, projectId: string) => [...endpointKeys.details(), endpointId, projectId] as const,
};

/**
 * Hook for fetching all endpoints for a project
 * @param projectId - The ID of the project to fetch endpoints for
 * @returns Query result with endpoints data, loading state, and error state
 */
export const useEndpoints = (projectId: string) => {
  return useQuery({
    queryKey: endpointKeys.list(projectId),
    queryFn: () => endpointsApi.getEndpoints(projectId),
    enabled: !!projectId,
  });
};

/**
 * Hook for fetching a single endpoint
 * @param endpointId - The ID of the endpoint to fetch
 * @param projectId - The ID of the project the endpoint belongs to
 * @returns Query result with endpoint data, loading state, and error state
 */
export const useEndpoint = (endpointId: string, projectId: string) => {
  return useQuery({
    queryKey: endpointKeys.detail(endpointId, projectId),
    queryFn: () => endpointsApi.getEndpoint(endpointId, projectId),
    enabled: !!endpointId && !!projectId,
  });
};

/**
 * Hook for creating a new endpoint
 * @param projectId - The ID of the project to create the endpoint in
 * @returns Mutation result with create function and status
 */
export const useCreateEndpoint = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (endpointData: EndpointData) => endpointsApi.createEndpoint(projectId, endpointData),
    onSuccess: (newEndpoint: Endpoint) => {
      // Invalidate endpoints list query to refetch
      queryClient.invalidateQueries({ queryKey: endpointKeys.list(projectId) });
      
      // Optimistically update the endpoints list
      queryClient.setQueryData<Endpoint[]>(endpointKeys.list(projectId), (oldData = []) => 
        [...oldData, newEndpoint]
      );
      
      toast.success("Endpoint created successfully");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create endpoint');
    },
  });
};

/**
 * Hook for updating an endpoint
 * @param endpointId - The ID of the endpoint to update
 * @param projectId - The ID of the project the endpoint belongs to
 * @returns Mutation result with update function and status
 */
export const useUpdateEndpoint = (endpointId: string, projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (endpointData: EndpointData) => endpointsApi.updateEndpoint(endpointId, endpointData),
    onMutate: async (newEndpointData: EndpointData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: endpointKeys.detail(endpointId, projectId) });
      await queryClient.cancelQueries({ queryKey: endpointKeys.list(projectId) });
      
      // Snapshot the previous value
      const previousEndpoint = queryClient.getQueryData<Endpoint>(endpointKeys.detail(endpointId, projectId));
      const previousEndpoints = queryClient.getQueryData<Endpoint[]>(endpointKeys.list(projectId));
      
      // Optimistically update to the new value
      if (previousEndpoint) {
        queryClient.setQueryData<Endpoint>(
          endpointKeys.detail(endpointId, projectId),
          { ...previousEndpoint, ...newEndpointData }
        );
      }
      
      if (previousEndpoints) {
        queryClient.setQueryData<Endpoint[]>(
          endpointKeys.list(projectId),
          previousEndpoints.map(endpoint => 
            endpoint.id === endpointId ? { ...endpoint, ...newEndpointData } : endpoint
          )
        );
      }
      
      return { previousEndpoint, previousEndpoints };
    },
    onSuccess: (updatedEndpoint: Endpoint) => {
      // Update the individual endpoint data
      queryClient.setQueryData(endpointKeys.detail(endpointId, projectId), updatedEndpoint);
      
      // Update the endpoint in the list
      queryClient.setQueryData<Endpoint[]>(endpointKeys.list(projectId), (oldData = []) => 
        oldData.map(endpoint => endpoint.id === endpointId ? updatedEndpoint : endpoint)
      );
      
      toast.success("Endpoint updated successfully");
    },
    onError: (error: unknown, _variables: EndpointData, context: { previousEndpoint?: Endpoint; previousEndpoints?: Endpoint[] } | undefined) => {
      // Rollback to the previous value if available
      if (context?.previousEndpoint) {
        queryClient.setQueryData(endpointKeys.detail(endpointId, projectId), context.previousEndpoint);
      }
      if (context?.previousEndpoints) {
        queryClient.setQueryData(endpointKeys.list(projectId), context.previousEndpoints);
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to update endpoint');
    },
    onSettled: () => {
      // Always refetch after error or success to synchronize with server state
      queryClient.invalidateQueries({ queryKey: endpointKeys.detail(endpointId, projectId) });
      queryClient.invalidateQueries({ queryKey: endpointKeys.list(projectId) });
    },
  });
};

/**
 * Hook for deleting an endpoint
 * @param projectId - The ID of the project the endpoint belongs to
 * @returns Mutation result with delete function and status
 */
export const useDeleteEndpoint = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (endpointId: string) => endpointsApi.deleteEndpoint(endpointId),
    onMutate: async (deletedEndpointId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: endpointKeys.list(projectId) });
      
      // Snapshot the previous value
      const previousEndpoints = queryClient.getQueryData<Endpoint[]>(endpointKeys.list(projectId));
      
      // Optimistically remove the endpoint from the list
      if (previousEndpoints) {
        queryClient.setQueryData<Endpoint[]>(
          endpointKeys.list(projectId),
          previousEndpoints.filter(endpoint => endpoint.id !== deletedEndpointId)
        );
      }
      
      return { previousEndpoints };
    },
    onSuccess: () => {
      toast.success("Endpoint deleted successfully");
    },
    onError: (error: unknown, _variables: string, context: { previousEndpoints?: Endpoint[] } | undefined) => {
      // Rollback to the previous value if available
      if (context?.previousEndpoints) {
        queryClient.setQueryData(endpointKeys.list(projectId), context.previousEndpoints);
      }
      
      toast.error(error instanceof Error ? error.message : 'Failed to delete endpoint');
    },
    onSettled: () => {
      // Always refetch after error or success to synchronize with server state
      queryClient.invalidateQueries({ queryKey: endpointKeys.list(projectId) });
    },
  });
};

/**
 * Hook for testing an endpoint
 * @param projectId - The ID of the project the endpoint belongs to
 * @returns Mutation result with test function and status
 */
export const useTestEndpoint = (projectId: string) => {
  return useMutation({
    mutationFn: async ({ 
      path, 
      method, 
      body = null, 
      requireAuth = false,
      apiKey = ''
    }: {
      path: string;
      method: string;
      body?: Record<string, unknown> | null;
      requireAuth?: boolean;
      apiKey?: string;
    }) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (requireAuth && apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const options: MockRequestOptions = {
        method,
        headers,
        ...(method === 'POST' || method === 'PUT' ? { data: body || {} } : {})
      };

      return mockApi.request(projectId, path, options);
    },
    onError: (error: unknown) => {
      console.error('Test request failed:', error);
      return error instanceof Error ? error.message : 'Failed to test endpoint';
    },
  });
};
