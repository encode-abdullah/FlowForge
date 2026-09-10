import { create } from 'zustand';

interface Node {
  id: string;
  type: string;
  data: { config: Record<string, unknown> };
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface EditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  updateNodeConfig: (id: string, config: Record<string, unknown>) => void;
  deleteNode: (id: string) => void;
  markDirty: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (id) => set({ selectedNodeId: id }),

  addNode: (type, position) => {
    const id = `node_${Date.now()}`;
    const newNode = { id, type, data: { config: {} }, position };
    set((state) => ({ nodes: [...state.nodes, newNode], isDirty: true }));
  },

  updateNodeConfig: (id, config) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, config } } : n,
      ),
      isDirty: true,
    }));
  },

  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
      isDirty: true,
    }));
  },

  markDirty: () => set({ isDirty: true }),
  reset: () => set({ nodes: [], edges: [], selectedNodeId: null, isDirty: false }),
}));
