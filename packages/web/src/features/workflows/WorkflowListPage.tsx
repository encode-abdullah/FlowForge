import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow } from './hooks/useWorkflow';
import { useAuthStore } from '../../stores/authStore';

export function WorkflowListPage() {
  const { data: workflows, isLoading } = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const deleteWorkflow = useDeleteWorkflow();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await createWorkflow.mutateAsync({ name: name.trim() });
    setName('');
    setShowCreate(false);
    if ((result as { id: string }).id) {
      navigate(`/workflows/${(result as { id: string }).id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">FlowForge</h1>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            New Workflow
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {showCreate && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workflow name"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : workflows?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No workflows yet</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create your first workflow
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows?.map((wf) => (
              <div
                key={wf.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center hover:shadow-md transition-shadow"
              >
                <Link to={`/workflows/${wf.id}`} className="flex-1">
                  <h3 className="font-semibold">{wf.name}</h3>
                  <p className="text-sm text-gray-500">
                    {wf._count.nodes} nodes · {wf._count.executions} executions
                    {wf.active && (
                      <span className="ml-2 text-green-600 font-medium">Active</span>
                    )}
                  </p>
                </Link>
                <div className="flex gap-2">
                  <Link
                    to={`/workflows/${wf.id}/executions`}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    History
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Delete this workflow?')) {
                        deleteWorkflow.mutate(wf.id);
                      }
                    }}
                    className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
