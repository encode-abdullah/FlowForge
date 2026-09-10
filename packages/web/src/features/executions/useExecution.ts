import { useMutation } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useReplayExecution() {
  return useMutation({
    mutationFn: ({ executionId, fromNodeId }: { executionId: string; fromNodeId?: string }) =>
      api.post<{ executionId: string }>(`/executions/${executionId}/replay`, { fromNodeId }),
  });
}
