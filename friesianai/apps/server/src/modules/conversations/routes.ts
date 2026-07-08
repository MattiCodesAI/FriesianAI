import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { parseOrReply } from '../../lib/validation.js';
import {
  createConversationSchema,
  createMessageSchema,
  idParamSchema,
  projectQuerySchema,
  updateConversationSchema,
} from './schemas.js';

/** Conversations and their messages, always scoped to a project. */
export async function conversationRoutes(app: FastifyInstance): Promise<void> {
  app.get('/conversations', async (request, reply) => {
    const query = parseOrReply(projectQuerySchema, request.query, reply);
    if (!query) return;
    return prisma.conversation.findMany({
      where: { projectId: query.projectId },
      orderBy: { updatedAt: 'desc' },
    });
  });

  app.post('/conversations', async (request, reply) => {
    const body = parseOrReply(createConversationSchema, request.body, reply);
    if (!body) return;
    const conversation = await prisma.conversation.create({ data: body });
    return reply.status(201).send(conversation);
  });

  app.patch('/conversations/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    const body = parseOrReply(updateConversationSchema, request.body, reply);
    if (!body) return;
    return prisma.conversation.update({ where: { id: params.id }, data: body });
  });

  app.delete('/conversations/:id', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    await prisma.conversation.delete({ where: { id: params.id } });
    return reply.status(204).send();
  });

  app.get('/conversations/:id/messages', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    return prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: 'asc' },
    });
  });

  app.post('/conversations/:id/messages', async (request, reply) => {
    const params = parseOrReply(idParamSchema, request.params, reply);
    if (!params) return;
    const body = parseOrReply(createMessageSchema, request.body, reply);
    if (!body) return;

    const [message] = await prisma.$transaction([
      prisma.message.create({ data: { ...body, conversationId: params.id } }),
      prisma.conversation.update({
        where: { id: params.id },
        data: { updatedAt: new Date() },
      }),
    ]);
    return reply.status(201).send(message);
  });
}
