import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import type { Env } from './config/env.js';
import { chatRoutes } from './modules/chat/routes.js';
import { conversationRoutes } from './modules/conversations/routes.js';
import { fileRoutes } from './modules/files/routes.js';
import { noteRoutes } from './modules/notes/routes.js';
import { projectRoutes } from './modules/projects/routes.js';
import { searchRoutes } from './modules/search/routes.js';

/** Build the Fastify app with all modules registered under /api. */
export async function buildApp(env: Env): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  });

  app.get('/api/health', async () => ({ status: 'ok', uptime: process.uptime() }));

  await app.register(
    async (api) => {
      await projectRoutes(api);
      await conversationRoutes(api);
      await fileRoutes(api);
      await noteRoutes(api);
      await searchRoutes(api);
      await chatRoutes(api);
    },
    { prefix: '/api' },
  );

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    const status = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
    void reply.status(status).send({
      error: status === 500 ? 'InternalServerError' : error.name,
      message: status === 500 ? 'Something went wrong' : error.message,
    });
  });

  return app;
}
