import type { FastifyReply } from 'fastify';
import type { z } from 'zod';

/**
 * Parse `input` with `schema`; on failure send a 400 with structured issues
 * and return null so route handlers can early-return.
 */
export function parseOrReply<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
  reply: FastifyReply,
): z.infer<T> | null {
  const result = schema.safeParse(input);
  if (!result.success) {
    void reply.status(400).send({
      error: 'ValidationError',
      issues: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return null;
  }
  return result.data;
}
