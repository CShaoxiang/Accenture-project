import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api-client';

export interface StatusSummary {
  requested: number;
  waiting: number;
  confirmed: number;
  needsAction: number;
  rejected: number;
}

export interface EntityStatusBreakdown {
  venues: StatusSummary;
  studentBodies: StatusSummary;
  stakeholders: StatusSummary;
}

export interface EventSummary {
  id: string;
  name: string;
  type: string;
  date: string;
  statusSummary: StatusSummary;
}

export interface DashboardData {
  eventSummaries: EventSummary[];
  overallStatus: StatusSummary;
  entityBreakdown: EntityStatusBreakdown;
}

export interface DashboardFilters {
  eventId?: string;
  entityType?: 'venue' | 'student_body' | 'stakeholder';
  status?: string;
}

export function useDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['dashboard', filters],
    queryFn: async () => {
      const response = await api.get<DashboardData>('/dashboard', {
        params: filters,
      });
      return response.data;
    },
  });
}
