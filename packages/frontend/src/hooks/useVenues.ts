import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  rating: number;
  amenities: string[];
  status: 'REQUESTED' | 'WAITING' | 'CONFIRMED' | 'NEEDS_ACTION' | 'REJECTED';
}

interface VenueSearchCriteria {
  location?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minRating?: number;
  amenities?: string[];
}

export function useVenues(criteria?: VenueSearchCriteria) {
  return useQuery({
    queryKey: ['venues', criteria],
    queryFn: async () => {
      const response = await api.get<Venue[]>('/venues', { params: criteria });
      return response.data;
    },
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const response = await api.get<Venue>(`/venues/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateVenueStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: Venue['status']) => {
      const response = await api.patch<Venue>(`/venues/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues', id] });
    },
  });
}
