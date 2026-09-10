import { Worker } from 'bullmq';
import { prisma } from '@flowforge/api/src/lib/prisma.js';
import { WorkflowExecutor, type ExecutionStorage } from '@flowforge/engine';
import type { NodeResult } from '@flowforge/shared';

const connection = { host: 'localhost', port: 6379 };

const storage: ExecutionStorage = {
  async updateExecutionStatus(id, status) {
    await prisma.execution.update({
      where: { id },
      data: {
        status,
        ...(status === 'running' ? { startedAt: new Date() } : {}),
        ...(status === 'completed' || status === 'failed' ? { completedAt: new Date() } : {}),
      },
    });
  },

  async updateNodeExecution(executionId, nodeId, data) {
    const existing = await prisma.nodeExecution.findFirst({
      where: { executionId, nodeId },
    });

    if (existing) {
      await prisma.nodeExecution.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.nodeExecution.create({
        data: {
          executionId,
          nodeId,
          ...data,
        },
      });
    }
  },

  async getNodeExecution(executionId, nodeId) {
    const ne = await prisma.nodeExecution.findFirst({
      where: { executionId, nodeId },
    });

    if (!ne) return null;

    return {
      nodeId: ne.nodeId,
      status: ne.status as NodeResult['status'],
      output: ne.output,
      error: ne.error ?? undefined,
      startedAt: ne.startedAt ?? new Date(),
      completedAt: ne.completedAt ?? undefined,
    };
  },
};

const executor = new WorkflowExecutor(storage);

const workflowWorker = new Worker(
  'workflow-execution',
  async (job) => {
    const { executionId, workflowId, replayFrom } = job.data;

    console.log(`[Worker] Processing execution ${executionId} for workflow ${workflowId}`);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const nodes = workflow.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      config: n.config as Record<string, unknown>,
      position: { x: n.positionX, y: n.positionY },
    }));

    const edges = workflow.edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      targetNodeId: e.targetNodeId,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    }));

    await executor.execute({ id: executionId, workflowId }, nodes, edges, replayFrom);

    console.log(`[Worker] Completed execution ${executionId}`);
  },
  {
    connection,
    concurrency: 5,
  },
);

workflowWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

workflowWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

console.log('[Worker] Workflow worker started, waiting for jobs...');

process.on('SIGINT', async () => {
  console.log('[Worker] Shutting down...');
  await workflowWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});
