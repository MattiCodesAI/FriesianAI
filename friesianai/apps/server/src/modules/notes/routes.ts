import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { parseOrReply } from '../../lib/validation.js';

const createNoteSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().max(50_000).default(''),
});

const updateNoteSchema = z
  .object({
    title: z.string().min(1).max(200),
    content: z.string().max(50_000),
  })
  .partial();

const idParamSchema = z.object({ id: z.string().uuid() });
const projectQuerySchema = z.object({ projectId: z.string().uuid() });

export async function noteRoutes(app: FastifyInstance): Promise<void> {
  app.get('/notes', async (request, reply) => {
    const query = parseOrReply(projectQuerySchema, request.query, reply);
    if (!query) return;
    return prisma.note.findMany({
      where: { projectId: query.projectId },
      orderBy: { updatedAt: 'desc' },
    });
  });

  app.post('/notes', async (request, reply) => {
    const body = parseOrReply(createNoteSchema, request.body, reply);
    if (!body) return;
    const note = await prisma.note.create({ data: body });
    return reply.status(201).send(note);
  });

  app.patch('/notes/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    const body = parseOrReply(updateNoteSchema, request.body, reply);
    if (!body) return;
    return prisma.note.update({ where: { id: params.id }, data: body });
  });

  app.delete('/notes/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    await prisma.note.delete({ where: { id: params.id } });
    return reply.status(204).send();
  });
}
