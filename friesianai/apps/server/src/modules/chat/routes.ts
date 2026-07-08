import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseOrReply } from '../../lib/validation.js';
import { providerForModel } from '../../ai/registry.js';

const chatRequestSchema = z.object({
  modelId: z.string().min(1).max(120),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      }),
    )
    .min(1),
  systemPrompt: z.string().max(16_000).optional(),
});

/**
 * POST /chat — streams a completion as Server-Sent Events.
 * Events: `data: {"type":"delta","text":"…"}` … `data: {"type":"done"}`.
 * The web app's provider layer can point at this endpoint to go live.
 */
export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.post('/chat', async (request, reply) => {
    const body = parseOrReply(chatRequestSchema, request.body, reply);
    if (!body) return;

    const provider = providerForModel(body.modelId);
    if (!provider) {
      return reply.status(400).send({ error: 'UnknownModel', modelId: body.modelId });
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const abort = new AbortController();
    request.raw.on('close', () => abort.abort());

    try {
      for await (const chunk of provider.streamChat({ ...body, signal: abort.signal })) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if (chunk.type === 'done' || chunk.type === 'error') break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'stream failed';
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
    } finally {
      reply.raw.end();
    }
  });
}
