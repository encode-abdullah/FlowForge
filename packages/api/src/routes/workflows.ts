import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  nodes: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        config: z.record(z.unknown()).default({}),
        position: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .optional(),
  edges: z
    .array(
      z.object({
        id: z.string(),
        sourceNodeId: z.string(),
        targetNodeId: z.string(),
        sourceHandle: z.string().default('output'),
        targetHandle: z.string().default('input'),
      }),
    )
    .optional(),
});

export async function workflowRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request) => {
    const workflows = await prisma.workflow.findMany({
      where: { userId: request.user.id },
      include: { _count: { select: { nodes: true, executions: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return workflows;
  });

  app.post('/', async (request, reply) => {
    const body = createWorkflowSchema.parse(request.body);

    const workflow = await prisma.workflow.create({
      data: {
        name: body.name,
        description: body.description,
        userId: request.user.id,
      },
    });

    return reply.status(201).send(workflow);
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: request.user.id },
      include: {
        nodes: true,
        edges: true,
        versions: { orderBy: { version: 'desc' }, take: 1 },
      },
    });

    if (!workflow) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    return workflow;
  });

  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateWorkflowSchema.parse(request.body);

    const existing = await prisma.workflow.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    const { nodes, edges, ...workflowData } = body;

    const workflow = await prisma.$transaction(async (tx) => {
      const updated = await tx.workflow.update({
        where: { id },
        data: workflowData,
      });

      if (nodes) {
        await tx.node.deleteMany({ where: { workflowId: id } });
        await tx.node.createMany({
          data: nodes.map((n) => ({
            id: n.id,
            workflowId: id,
            type: n.type,
            config: n.config,
            positionX: n.position.x,
            positionY: n.position.y,
          })),
        });
      }

      if (edges) {
        await tx.edge.deleteMany({ where: { workflowId: id } });
        await tx.edge.createMany({
          data: edges.map((e) => ({
            id: e.id,
            workflowId: id,
            sourceNodeId: e.sourceNodeId,
            targetNodeId: e.targetNodeId,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
          })),
        });
      }

      return updated;
    });

    return workflow;
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.workflow.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    await prisma.workflow.delete({ where: { id } });

    return { success: true };
  });

  app.post('/:id/activate', async (request, reply) => {
    const { id } = request.params as { id: string };

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: request.user.id },
      include: { nodes: true, edges: true },
    });

    if (!workflow) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.workflow.update({
        where: { id },
        data: { active: true },
      });

      const lastVersion = await tx.workflowVersion.findFirst({
        where: { workflowId: id },
        orderBy: { version: 'desc' },
      });

      const newVersion = (lastVersion?.version ?? 0) + 1;

      await tx.workflowVersion.create({
        data: {
          workflowId: id,
          version: newVersion,
          definition: {
            nodes: workflow.nodes.map((n) => ({
              id: n.id,
              type: n.type,
              config: n.config,
              position: { x: n.positionX, y: n.positionY },
            })),
            edges: workflow.edges.map((e) => ({
              id: e.id,
              sourceNodeId: e.sourceNodeId,
              targetNodeId: e.targetNodeId,
              sourceHandle: e.sourceHandle,
              targetHandle: e.targetHandle,
            })),
          },
        },
      });

      return { version: newVersion };
    });

    return result;
  });

  app.get('/:id/versions', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.workflow.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    const versions = await prisma.workflowVersion.findMany({
      where: { workflowId: id },
      orderBy: { version: 'desc' },
    });

    return versions;
  });

  app.post('/:id/execute', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { input?: unknown };

    const workflow = await prisma.workflow.findFirst({
      where: { id, userId: request.user.id },
      include: { nodes: true, edges: true },
    });

    if (!workflow) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    const execution = await prisma.execution.create({
      data: {
        workflowId: id,
        version: workflow.versions?.[0]?.version ?? 1,
        triggerType: 'manual',
        input: body.input ?? null,
        status: 'pending',
      },
    });

    return reply.status(201).send({ executionId: execution.id });
  });
}
