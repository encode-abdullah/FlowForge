import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/:workflowId', async (request, reply) => {
    const { workflowId } = request.params as { workflowId: string };

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow || !workflow.active) {
      return reply.status(404).send({ error: 'Workflow not found or inactive' });
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId,
        version: 1,
        triggerType: 'webhook',
        input: request.body,
        status: 'pending',
      },
    });

    return reply.status(202).send({
      executionId: execution.id,
      status: 'queued',
    });
  });
}
