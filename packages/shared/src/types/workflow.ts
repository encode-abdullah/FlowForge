export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type NodeExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export type TriggerType = 'manual' | 'webhook' | 'api' | 'replay';

export interface WorkflowNode {
  id: string;
  type: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  variables: Record<string, unknown>;
  nodeResults: Map<string, NodeResult>;
}

export interface NodeResult {
  nodeId: string;
  status: NodeExecutionStatus;
  output: unknown;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export interface Execution {
  id: string;
  workflowId: string;
  version: number;
  status: ExecutionStatus;
  triggerType: TriggerType;
  input: unknown;
  output: unknown;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface NodeExecution {
  id: string;
  executionId: string;
  nodeId: string;
  status: NodeExecutionStatus;
  input: unknown;
  output: unknown;
  error: string | null;
  attempt: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  version: number;
  definition: WorkflowDefinition;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}
