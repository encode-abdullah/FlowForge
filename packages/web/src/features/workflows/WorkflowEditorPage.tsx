import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useWorkflow, useSaveWorkflow, useExecuteWorkflow, useActivateWorkflow } from './hooks/useWorkflow';
import { useEditorStore } from '../../stores/editorStore';
import { Sidebar } from './components/Sidebar';
import { NodeConfigPanel } from './components/NodeConfigPanel';

const nodeTypes = {};

export function WorkflowEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: workflow, isLoading } = useWorkflow(id!);
  const saveWorkflow = useSaveWorkflow(id!);
  const executeWorkflow = useExecuteWorkflow(id!);
  const activateWorkflow = useActivateWorkflow(id!);

  const { nodes, edges, setNodes, setEdges, selectedNodeId, selectNode, addNode, isDirty, markDirty } =
    useEditorStore();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (workflow) {
      const mappedNodes: Node[] = (workflow.nodes || []).map((n: any) => ({
        id: n.id,
        type: 'default',
        position: { x: n.positionX ?? n.position?.x ?? 0, y: n.positionY ?? n.position?.y ?? 0 },
        data: { label: n.type, config: n.config },
      }));
      const mappedEdges: Edge[] = (workflow.edges || []).map((e: any) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      }));
      setRfNodes(mappedNodes);
      setRfEdges(mappedEdges);
    }
  }, [workflow]);

  const onConnect = (connection: Connection) => {
    setRfEdges((eds) => addEdge(connection, eds));
    markDirty();
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  };

  const onPaneClick = () => {
    selectNode(null);
  };

  const handleSave = async () => {
    const nodesData = rfNodes.map((n) => ({
      id: n.id,
      type: n.data.label as string,
      config: n.data.config || {},
      position: n.position,
    }));
    const edgesData = rfEdges.map((e) => ({
      id: e.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      sourceHandle: e.sourceHandle || 'output',
      targetHandle: e.targetHandle || 'input',
    }));

    await saveWorkflow.mutateAsync({ nodes: nodesData, edges: edgesData });
  };

  const handleExecute = async () => {
    const result = await executeWorkflow.mutateAsync();
    if (result.executionId) {
      navigate(`/executions/${result.executionId}`);
    }
  };

  const handleActivate = async () => {
    await handleSave();
    await activateWorkflow.mutateAsync();
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = {
      x: event.clientX - 300,
      y: event.clientY - 100,
    };

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'default',
      position,
      data: { label: type, config: {} },
    };

    setRfNodes((nds) => [...nds, newNode]);
    markDirty();
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading workflow...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Link to="/workflows" className="text-gray-500 hover:text-gray-700">
            &larr; Back
          </Link>
          <h1 className="font-semibold">{workflow?.name || 'Untitled'}</h1>
          {isDirty && <span className="text-xs text-orange-500">Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleActivate}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
          >
            Activate
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty || saveWorkflow.isPending}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {saveWorkflow.isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleExecute}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Execute
          </button>
          <Link
            to={`/workflows/${id}/executions`}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
          >
            History
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {selectedNodeId && (
          <NodeConfigPanel
            nodeId={selectedNodeId}
            node={rfNodes.find((n) => n.id === selectedNodeId)}
            onUpdate={(config) => {
              setRfNodes((nds) =>
                nds.map((n) =>
                  n.id === selectedNodeId ? { ...n, data: { ...n.data, config } } : n,
                ),
              );
              markDirty();
            }}
            onDelete={() => {
              setRfNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
              setRfEdges((eds) =>
                eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
              );
              selectNode(null);
              markDirty();
            }}
          />
        )}
      </div>
    </div>
  );
}
