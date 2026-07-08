import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { parseOrReply } from '../../lib/validation.js';

const createFileSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  kind: z.enum(['PDF', 'TEXT', 'MARKDOWN', 'IMAGE', 'OTHER']).default('OTHER'),
  mimeType: z.string().max(255),
  size: z.number().int().nonnegative(),
  storageKey: z.string().max(1024).optional(),
});

const idParamSchema = z.object({ id: z.string().uuid() });
const projectQuerySchema = z.object({ projectId: z.string().uuid() });

/**
 * File metadata. Binary upload/storage (S3, local disk) plugs in here later;
 * the `indexed` flag is flipped by the future embedding pipeline.
 */
export async function fileRoutes(app: FastifyInstance): Promise<void> {
  app.get('/files', async (request, reply) => {
    const query = parseOrReply(projectQuerySchema, request.query, reply);
    if (!query) return;
    return prisma.file.findMany({
      where: { projectId: query.projectId },
      orderBy: { createdAt: 'desc' },
    });
  });

  app.post('/files', async (request, reply) => {
    const body = parseOrReply(createFileSchema, request.body, reply);
    if (!body) return;
    const file = await prisma.file.create({ data: body });
    return reply.status(201).send(file);
  });

  app.delete('/files/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    await prisma.file.delete({ where: { id: params.id } });
    return reply.status(204).send();
  });
}
