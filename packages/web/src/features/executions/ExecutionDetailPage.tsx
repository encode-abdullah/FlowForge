import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface NodeExec {
  id: string;
  nodeId: string;
  status: string;
  input: unknown;
  output: unknown;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  node: { id: string; type: string; config: unknown };
}

interface ExecutionDetail {
  id: string;
  status: string;
  triggerType: string;
  input: unknown;
  output: unknown;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  workflow: { id: string; name: string };
  nodeExecutions: NodeExec[];
}

const STATUS_ICONS: Record<string, string> = {
  completed: '✅',
  failed: '❌',
  skipped: '⏭️',
  running: '🔄',
  pending: '⏳',
};

export function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: execution, isLoading } = useQuery({
    queryKey: ['execution', id],
    queryFn: () => api.get<ExecutionDetail>(`/executions/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading execution...</p>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Execution not found</p>
      </div>
    );
  }

  const duration =
    execution.startedAt && execution.completedAt
      ? ((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/workflows/${execution.workflow.id}/executions`}
            className="text-gray-500 hover:text-gray-700"
          >
            &larr; History
          </Link>
          <h1 className="text-xl font-bold">Execution Detail</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold">{execution.workflow.name}</h2>
              <p className="text-sm text-gray-500">ID: {execution.id}</p>
            </div>
            <div className="text-right">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  execution.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : execution.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {execution.status}
              </span>
              {duration && <p className="text-sm text-gray-500 mt-1">{duration}s</p>}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Trigger: {execution.triggerType}</p>
            <p>Started: {execution.startedAt ? new Date(execution.startedAt).toLocaleString() : '-'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Node Timeline</h3>
          <div className="space-y-3">
            {execution.nodeExecutions.map((ne) => (
              <div
                key={ne.id}
                className={`flex items-start gap-3 p-3 rounded border-l-4 ${
                  ne.status === 'completed'
                    ? 'border-green-500 bg-green-50'
                    : ne.status === 'failed'
                      ? 'border-red-500 bg-red-50'
                      : ne.status === 'skipped'
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-blue-500 bg-blue-50'
                }`}
              >
                <span className="text-lg">{STATUS_ICONS[ne.status] || '⏳'}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm capitalize">
                      {String(ne.node.type).replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ne.startedAt && ne.completedAt
                        ? `${((new Date(ne.completedAt).getTime() - new Date(ne.startedAt).getTime()) / 1000).toFixed(1)}s`
                        : ''}
                    </span>
                  </div>
                  {ne.error && <p className="text-xs text-red-600 mt-1">{ne.error}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
