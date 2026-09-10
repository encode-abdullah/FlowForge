import type { WorkflowNode, WorkflowEdge, ExecutionContext, NodeResult } from '@flowforge/shared';
import { buildDag, type DagNode, type ExecutionPlan } from './dag-builder.js';
import { getNodeExecutors, type NodeExecutor } from '../nodes/index.js';
import { withRetry } from '../retry/retry-handler.js';

export interface ExecutionStorage {
  updateExecutionStatus(id: string, status: string): Promise<void>;
  updateNodeExecution(
    executionId: string,
    nodeId: string,
    data: {
      status?: string;
      input?: unknown;
      output?: unknown;
      error?: string;
      startedAt?: Date;
      completedAt?: Date;
    },
  ): Promise<void>;
  getNodeExecution(executionId: string, nodeId: string): Promise<NodeResult | null>;
}

export class WorkflowExecutor {
  private nodeExecutors: Map<string, NodeExecutor>;

  constructor(private storage: ExecutionStorage) {
    this.nodeExecutors = getNodeExecutors();
  }

  async execute(
    execution: { id: string; workflowId: string },
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    replayFrom?: string,
  ): Promise<void> {
    const plan = buildDag(nodes, edges);
    const context: ExecutionContext = {
      workflowId: execution.workflowId,
      executionId: execution.id,
      variables: {},
      nodeResults: new Map(),
    };

    await this.storage.updateExecutionStatus(execution.id, 'running');

    let startProcessing = !replayFrom;

    try {
      for (const level of plan.levels) {
        if (!startProcessing) {
          const hasReplayTarget = level.some((n) => n.id === replayFrom);
          if (!hasReplayTarget) {
            for (const node of level) {
              await this.storage.updateNodeExecution(execution.id, node.id, {
                status: 'skipped',
              });
              context.nodeResults.set(node.id, {
                nodeId: node.id,
                status: 'skipped',
                output: null,
                startedAt: new Date(),
                completedAt: new Date(),
              });
            }
            continue;
          }
          startProcessing = true;
        }

        if (replayFrom) {
          const existingResult = await this.storage.getNodeExecution(execution.id, replayFrom);
          if (existingResult && existingResult.status === 'completed') {
            if (level.every((n) => n.id !== replayFrom)) {
              for (const node of level) {
                await this.storage.updateNodeExecution(execution.id, node.id, {
                  status: 'skipped',
                });
              }
              continue;
            }
          }
        }

        const results = await Promise.allSettled(
          level.map((node) => this.executeNode(node, context)),
        );

        const failed = level.filter((_, i) => results[i].status === 'rejected');
        if (failed.length > 0) {
          for (const level of plan.levels) {
            for (const node of level) {
              if (!context.nodeResults.has(node.id)) {
                await this.storage.updateNodeExecution(execution.id, node.id, {
                  status: 'skipped',
                });
              }
            }
          }
          throw new Error(`Node(s) failed: ${failed.map((n) => n.id).join(', ')}`);
        }
      }

      await this.storage.updateExecutionStatus(execution.id, 'completed');
    } catch (error) {
      await this.storage.updateExecutionStatus(execution.id, 'failed');
      throw error;
    }
  }

  private async executeNode(node: DagNode, context: ExecutionContext): Promise<void> {
    const executor = this.nodeExecutors.get(node.type);
    if (!executor) throw new Error(`Unknown node type: ${node.type}`);

    const input = this.gatherInputs(node, context);

    await this.storage.updateNodeExecution(context.executionId, node.id, {
      status: 'running',
      input,
      startedAt: new Date(),
    });

    try {
      const output = await withRetry(() => executor.execute(input, node.config, context));

      context.nodeResults.set(node.id, {
        nodeId: node.id,
        status: 'completed',
        output,
        startedAt: new Date(),
        completedAt: new Date(),
      });

      await this.storage.updateNodeExecution(context.executionId, node.id, {
        status: 'completed',
        output,
        completedAt: new Date(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      context.nodeResults.set(node.id, {
        nodeId: node.id,
        status: 'failed',
        output: null,
        error: errorMessage,
        startedAt: new Date(),
        completedAt: new Date(),
      });

      await this.storage.updateNodeExecution(context.executionId, node.id, {
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      });

      throw error;
    }
  }

  private gatherInputs(node: DagNode, context: ExecutionContext): unknown {
    if (node.dependencies.length === 0) {
      return context.variables;
    }

    const inputs: Record<string, unknown> = {};
    for (const depId of node.dependencies) {
      const result = context.nodeResults.get(depId);
      if (result) {
        inputs[depId] = result.output;
      }
    }

    return { ...context.variables, ...inputs };
  }
}
