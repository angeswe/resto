import { useCallback, useState } from 'react';
import { endpointsApi } from '../utils/api';
import { toast } from 'react-toastify';
import { Endpoint } from '../types/project';

interface UseEndpointsReturn {
  loading: boolean;
  error: string | null;
  endpoints: Endpoint[];
  getEndpoint: (endpointId: string, projectId: string) => Promise<Endpoint>;
  getEndpoints: (projectId: string) => Promise<Endpoint[]>;
  addEndpoint: (projectId: string, endpointData: any) => Promise<void>;
  updateEndpoint: (endpointId: string, endpointData: any) => Promise<void>;
  deleteEndpoint: (endpointId: string) => Promise<void>;
}

export const useEndpoints = (): UseEndpointsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  const getEndpoint = useCallback(async (endpointId: string, projectId: string): Promise<Endpoint> => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = await endpointsApi.getEndpoint(endpointId, projectId);
      return endpoint;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const getEndpoints = useCallback(async (projectId: string): Promise<Endpoint[]> => {
    try {
      setLoading(true);
      setError(null);
      const endpoints = await endpointsApi.getEndpoints(projectId);
      setEndpoints(endpoints);
      return endpoints;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch endpoints');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch endpoints');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setEndpoints, setLoading, setError]);

  const addEndpoint = useCallback(async (projectId: string, endpointData: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setEndpoints(prev => [...prev, endpointData]);

      const response = await endpointsApi.createEndpoint(projectId, endpointData);
      
      // Update with actual endpoint data
      setEndpoints(prev => [...prev, response]);

      toast.success("Endpoint added successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to add endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setEndpoints, setLoading, setError]);

  const updateEndpoint = useCallback(async (endpointId: string, endpointData: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setEndpoints(prev => prev.map(endpoint => 
        endpoint.id === endpointId ? { ...endpoint, ...endpointData } : endpoint
      ));

      const response = await endpointsApi.updateEndpoint(endpointId, endpointData);
      
      // Update with actual endpoint data
      setEndpoints(prev => prev.map(endpoint => 
        endpoint.id === endpointId ? { ...endpoint, ...response } : endpoint
      ));

      toast.success("Endpoint updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to update endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setEndpoints, setLoading, setError]);

  const deleteEndpoint = useCallback(async (endpointId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setEndpoints(prev => prev.filter(endpoint => endpoint.id !== endpointId));

      await endpointsApi.deleteEndpoint(endpointId);
      toast.success("Endpoint deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete endpoint');
      toast.error(err instanceof Error ? err.message : 'Failed to delete endpoint');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setEndpoints, setLoading, setError]);

  return {
    loading,
    error,
    endpoints,
    getEndpoint,
    getEndpoints,
    addEndpoint,
    updateEndpoint,
    deleteEndpoint,
  };
};
