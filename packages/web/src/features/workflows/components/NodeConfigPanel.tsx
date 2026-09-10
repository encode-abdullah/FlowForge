import { useState, useEffect } from 'react';
import type { Node } from 'reactflow';

interface NodeConfigPanelProps {
  nodeId: string;
  node: Node | undefined;
  onUpdate: (config: Record<string, unknown>) => void;
  onDelete: () => void;
}

export function NodeConfigPanel({ nodeId, node, onUpdate, onDelete }: NodeConfigPanelProps) {
  const [config, setConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (node) {
      setConfig(node.data?.config || {});
    }
  }, [node]);

  const handleUpdate = (key: string, value: unknown) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  if (!node) return null;

  const nodeType = node.data?.label as string;

  return (
    <aside className="w-72 bg-white border-l p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold capitalize">{nodeType}</h3>
        <button onClick={onDelete} className="text-red-500 text-sm hover:underline">
          Delete
        </button>
      </div>

      <div className="space-y-3">
        {nodeType === 'httpRequest' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">URL</label>
              <input
                type="text"
                value={(config.url as string) || ''}
                onChange={(e) => handleUpdate('url', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://api.example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Method</label>
              <select
                value={(config.method as string) || 'GET'}
                onChange={(e) => handleUpdate('method', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'condition' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Variable</label>
              <input
                type="text"
                value={(config.variable as string) || ''}
                onChange={(e) => handleUpdate('variable', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="status"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Operator</label>
              <select
                value={(config.operator as string) || 'eq'}
                onChange={(e) => handleUpdate('operator', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="eq">Equals</option>
                <option value="neq">Not Equals</option>
                <option value="gt">Greater Than</option>
                <option value="lt">Less Than</option>
                <option value="contains">Contains</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
              <input
                type="text"
                value={(config.value as string) || ''}
                onChange={(e) => handleUpdate('value', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {nodeType === 'delay' && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (seconds)</label>
            <input
              type="number"
              value={(config.duration as number) || 1}
              onChange={(e) => handleUpdate('duration', Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min={1}
            />
          </div>
        )}

        {nodeType === 'email' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="email"
                value={(config.to as string) || ''}
                onChange={(e) => handleUpdate('to', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
              <input
                type="text"
                value={(config.subject as string) || ''}
                onChange={(e) => handleUpdate('subject', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {!['httpRequest', 'condition', 'delay', 'email'].includes(nodeType) && (
          <p className="text-xs text-gray-400">
            Configure this node by editing its properties in the code.
          </p>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-400">Node ID: {nodeId.slice(0, 12)}...</p>
        </div>
      </div>
    </aside>
  );
}
