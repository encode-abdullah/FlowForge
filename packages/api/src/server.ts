import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { authPlugin } from './plugins/auth.js';
import { authRoutes } from './routes/auth.js';
import { workflowRoutes } from './routes/workflows.js';
import { executionRoutes } from './routes/executions.js';
import { webhookRoutes } from './routes/webhooks.js';

const port = Number(process.env.API_PORT) || 3001;

const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
});

await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'dev-secret-change-in-prod' });
await app.register(authPlugin);

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(workflowRoutes, { prefix: '/api/workflows' });
await app.register(executionRoutes, { prefix: '/api/executions' });
await app.register(webhookRoutes, { prefix: '/api/webhooks' });

app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

try {
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`API server running on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
