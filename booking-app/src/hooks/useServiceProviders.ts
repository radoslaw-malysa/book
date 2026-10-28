import { useQuery } from '@tanstack/react-query';
import { getServiceProviders, type Provider } from '@/api/providers';

export function useServiceProviders(serviceId: number | null) {
  return useQuery<Provider[], Error>({
    // Query key includes the serviceId so each lesson has its own cache entry
    queryKey: ['serviceProviders', serviceId],

    // Query function: TanStack Query passes an AbortSignal automatically
    queryFn: ({ signal }) => {
      if (serviceId === null) {
        throw new Error('Lesson ID is required');
      }
      return getServiceProviders(serviceId, signal);
    },

    // Dependent query: do not run the query until a valid serviceId is chosen
    enabled: serviceId !== null,

    // Caching configuration:
    staleTime: 1000 * 60 * 2, // Data is fresh for 2 minutes (no background refetch)
    gcTime: 1000 * 60 * 10,   // Unused data remains in cache for 10 minutes
  });
}