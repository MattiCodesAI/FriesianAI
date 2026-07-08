import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { parseOrReply } from '../../lib/validation.js';

const searchQuerySchema = z.object({
  q: z.string().min(2).max(200),
  projectId: z.string().uuid().optional(),
});

/**
 * Global search. MVP: ILIKE substring matching in PostgreSQL.
 * Future: replace the internals with pgvector similarity search over
 * embeddings — the response shape stays the same, so clients don't change.
 */
export async function searchRoutes(app: FastifyInstance): Promise<void> {
  app.get('/search', async (request, reply) => {
    const query = parseOrReply(searchQuerySchema, request.query, reply);
    if (!query) return;

    const contains = { contains: query.q, mode: 'insensitive' as const };
    const projectFilter = query.projectId ? { projectId: query.projectId } : {};

    const [projects, conversations, messages, notes, files] = await Promise.all([
      prisma.project.findMany({
        where: { OR: [{ name: contains }, { description: contains }] },
        take: 5,
      }),
      prisma.conversation.findMany({
        where: { ...projectFilter, title: contains },
        take: 5,
      }),
      prisma.message.findMany({
        where: { content: contains, conversation: query.projectId ? { projectId: query.projectId } : undefined },
        take: 5,
        include: { conversation: { select: { id: true, title: true, projectId: true } } },
      }),
      prisma.note.findMany({
        where: { ...projectFilter, OR: [{ title: contains }, { content: contains }] },
        take: 5,
      }),
      prisma.file.findMany({
        where: { ...projectFilter, name: contains },
        take: 5,
      }),
    ]);

    return { projects, conversations, messages, notes, files };
  });
}
