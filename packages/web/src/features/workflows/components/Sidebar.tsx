import { NODE_TYPE_LIST } from '@flowforge/shared';

const NODE_ICONS: Record<string, string> = {
  webhook: '🔗',
  httpRequest: '🌐',
  condition: '🔀',
  transform: '🔄',
  delay: '⏱️',
  setVariable: '📦',
  email: '📧',
  database: '🗄️',
  code: '💻',
  loop: '🔁',
};

export function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-56 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Nodes</h2>
      <div className="space-y-2">
        {NODE_TYPE_LIST.map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => onDragStart(e, type)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded cursor-grab hover:bg-gray-100 transition-colors text-sm"
          >
            <span>{NODE_ICONS[type] || '⚡'}</span>
            <span className="capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
