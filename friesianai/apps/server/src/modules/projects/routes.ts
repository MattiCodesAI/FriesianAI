import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { parseOrReply } from '../../lib/validation.js';
import { createProjectSchema, idParamSchema, updateProjectSchema } from './schemas.js';

/** CRUD for projects — the isolation boundary for everything else. */
export async function projectRoutes(app: FastifyInstance): Promise<void> {
  app.get('/projects', async () => {
    return prisma.project.findMany({ orderBy: { updatedAt: 'desc' } });
  });

  app.get('/projects/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return reply.status(404).send({ error: 'NotFound' });
    return project;
  });

  app.post('/projects', async (request, reply) => {
    const body = parseOrReply(createProjectSchema, request.body, reply);
    if (!body) return;
    const project = await prisma.project.create({ data: body });
    return reply.status(201).send(project);
  });

  app.patch('/projects/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    const body = parseOrReply(updateProjectSchema, request.body, reply);
    if (!body) return;
    const project = await prisma.project.update({ where: { id: params.id }, data: body });
    return project;
  });

  app.delete('/projects/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    await prisma.project.delete({ where: { id: params.id } });
    return reply.status(204).send();
  });
}
