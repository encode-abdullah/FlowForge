import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function executionRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request) => {
    const { workflowId, status } = request.query as { workflowId?: string; status?: string };

    const where: Record<string, unknown> = {};
    if (workflowId) where.workflowId = workflowId;
    if (status) where.status = status;

    const executions = await prisma.execution.findMany({
      where,
      include: {
        workflow: { select: { id: true, name: true } },
        _count: { select: { nodeExecutions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return executions;
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        workflow: { select: { id: true, name: true } },
        nodeExecutions: {
          include: { node: { select: { id: true, type: true, config: true } } },
          orderBy: { startedAt: 'asc' },
        },
      },
    });

    if (!execution) {
      return reply.status(404).send({ error: 'Execution not found' });
    }

    return execution;
  });

  app.post('/:id/replay', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { fromNodeId } = (request.body ?? {}) as { fromNodeId?: string };

    const originalExecution = await prisma.execution.findUnique({
      where: { id },
      include: { nodeExecutions: true, workflow: true },
    });

    if (!originalExecution) {
      return reply.status(404).send({ error: 'Execution not found' });
    }

    const newExecution = await prisma.$transaction(async (tx) => {
      const exec = await tx.execution.create({
        data: {
          workflowId: originalExecution.workflowId,
          version: originalExecution.version,
          triggerType: 'replay',
          input: originalExecution.input,
          status: 'pending',
        },
      });

      const successfulNodes = originalExecution.nodeExecutions
        .filter((ne) => ne.status === 'completed')
        .filter((ne) => !fromNodeId || ne.nodeId !== fromNodeId);

      for (const ne of successfulNodes) {
        await tx.nodeExecution.create({
          data: {
            executionId: exec.id,
            nodeId: ne.nodeId,
            status: 'completed',
            input: ne.input,
            output: ne.output,
            startedAt: ne.startedAt,
            completedAt: ne.completedAt,
          },
        });
      }

      return exec;
    });

    return reply.status(201).send({ executionId: newExecution.id });
  });
}
