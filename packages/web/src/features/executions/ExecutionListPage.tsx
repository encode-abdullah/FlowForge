import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useReplayExecution } from './useExecution';

interface ExecutionSummary {
  id: string;
  status: string;
  triggerType: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export function ExecutionListPage() {
  const { id: workflowId } = useParams<{ id: string }>();

  const { data: executions, isLoading } = useQuery({
    queryKey: ['executions', workflowId],
    queryFn: () => api.get<ExecutionSummary[]>(`/executions?workflowId=${workflowId}`),
    enabled: !!workflowId,
  });

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to={`/workflows/${workflowId}`} className="text-gray-500 hover:text-gray-700">
            &larr; Editor
          </Link>
          <h1 className="text-xl font-bold">Execution History</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : executions?.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No executions yet</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Trigger</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Started</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Duration</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {executions?.map((exec) => (
                  <tr key={exec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${statusColor[exec.status] || ''}`}>
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exec.triggerType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {exec.startedAt && exec.completedAt
                        ? `${((new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000).toFixed(1)}s`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/executions/${exec.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
