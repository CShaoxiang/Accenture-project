import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

export interface Venue {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  rating?: number;
  amenities?: string[];
  contactInfo?: any;
  status: string;
  lastContactDate?: string;
}

export interface EventVenue {
  eventId: string;
  venueId: string;
  venue: Venue;
}

export interface StudentBody {
  eventId: string;
  studentBodyId: string;
  studentBodyType: string;
  status: string;
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  explanation?: string;
  priority?: number;
  dependencies?: string[];
  completed: boolean;
  completedAt?: string;
}

export interface Event {
  id: string;
  name: string;
  type: 'hackathon' | 'bootcamp' | 'networking';
  date: string;
  description?: string;
  goals?: string[];
  companyId?: string;
  createdAt: string;
  updatedAt: string;
  venues?: EventVenue[];
  studentBodies?: StudentBody[];
  tasks?: Task[];
}

export interface CreateEventDTO {
  name: string;
  type: 'hackathon' | 'bootcamp' | 'networking';
  date: string;
  description?: string;
  goals?: string[];
  companyId?: string;
}

export interface EventFilters {
  type?: string;
  companyId?: string;
  startDate?: string;
  endDate?: string;
}

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.companyId) params.append('companyId', filters.companyId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response = await api.get<Event[]>(`/events?${params.toString()}`);
      return response.data;
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const response = await api.get<Event>(`/events/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventDTO) => {
      const response = await api.post<Event>('/events', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateEventDTO>) => {
      const response = await api.put<Event>(`/events/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
