import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api-client';

export interface OverdueEntity {
  entityId: string;
  entityType: 'venue' | 'student_body' | 'stakeholder';
  name: string;
  status: string;
  lastContactDate: string | null;
  daysOverdue: number;
}

export interface ReminderDraft {
  id: string;
  entityId: string;
  entityType: string;
  subject: string;
  body: string;
  generatedAt: string;
}

export function useOverdueEntities(thresholdDays: number = 7) {
  return useQuery({
    queryKey: ['reminders', 'overdue', thresholdDays],
    queryFn: async () => {
      const response = await api.get<OverdueEntity[]>('/reminders/overdue', {
        params: { thresholdDays },
      });
      return response.data;
    },
  });
}

export function useGenerateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { entityId: string; entityType: string }) => {
      const response = await api.post<ReminderDraft>('/reminders/generate', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useMarkAsContacted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { entityId: string; entityType: string }) => {
      const response = await api.post('/reminders/mark-contacted', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useApproveReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const response = await api.post(`/reminders/${reminderId}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
