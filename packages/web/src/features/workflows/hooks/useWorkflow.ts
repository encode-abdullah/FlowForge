import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';

interface WorkflowSummary {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  _count: { nodes: number; executions: number };
}

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get<WorkflowSummary[]>('/workflows'),
  });
}

export function useWorkflow(id: string) {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => api.get<WorkflowSummary & { nodes: unknown[]; edges: unknown[] }>(`/workflows/${id}`),
    enabled: !!id,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.post('/workflows', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });
}

export function useSaveWorkflow(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; nodes?: unknown[]; edges?: unknown[] }) =>
      api.put(`/workflows/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', id] });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  });
}

export function useExecuteWorkflow(id: string) {
  return useMutation({
    mutationFn: (input?: unknown) => api.post<{ executionId: string }>(`/workflows/${id}/execute`, { input }),
  });
}

export function useActivateWorkflow(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ version: number }>(`/workflows/${id}/activate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflow', id] }),
  });
}
