import type { WorkflowNode, WorkflowEdge } from '@flowforge/shared';

export interface DagNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
  dependencies: string[];
  dependents: string[];
}

export interface ExecutionPlan {
  levels: DagNode[][];
  totalNodes: number;
  nodeMap: Map<string, DagNode>;
}

export function buildDag(nodes: WorkflowNode[], edges: WorkflowEdge[]): ExecutionPlan {
  const nodeMap = new Map<string, DagNode>();

  for (const node of nodes) {
    nodeMap.set(node.id, {
      id: node.id,
      type: node.type,
      config: node.config,
      dependencies: [],
      dependents: [],
    });
  }

  for (const edge of edges) {
    const source = nodeMap.get(edge.sourceNodeId);
    const target = nodeMap.get(edge.targetNodeId);
    if (source && target) {
      target.dependencies.push(source.id);
      source.dependents.push(target.id);
    }
  }

  if (hasCycle(nodeMap)) {
    throw new Error('Workflow contains a cycle');
  }

  const levels = topologicalSort(nodeMap);

  return { levels, totalNodes: nodes.length, nodeMap };
}

function hasCycle(nodeMap: Map<string, DagNode>): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = nodeMap.get(nodeId)!;
    for (const dep of node.dependents) {
      if (!visited.has(dep)) {
        if (dfs(dep)) return true;
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const nodeId of nodeMap.keys()) {
    if (!visited.has(nodeId) && dfs(nodeId)) return true;
  }
  return false;
}

function topologicalSort(nodeMap: Map<string, DagNode>): DagNode[][] {
  const levels: DagNode[][] = [];
  const completed = new Set<string>();

  while (completed.size < nodeMap.size) {
    const level: DagNode[] = [];

    for (const [id, node] of nodeMap) {
      if (completed.has(id)) continue;
      if (node.dependencies.every((dep) => completed.has(dep))) {
        level.push(node);
      }
    }

    if (level.length === 0) {
      throw new Error('Deadlock detected in workflow');
    }

    for (const node of level) {
      completed.add(node.id);
    }

    levels.push(level);
  }

  return levels;
}
