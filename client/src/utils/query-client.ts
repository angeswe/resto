import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient configuration with optimized settings for performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: import.meta.env.PROD, // Only in production
    },
    mutations: {
      retry: 1,
    },
  },
});
