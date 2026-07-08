import { z } from 'zod';

export const createConversationSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200).default('New chat'),
  modelId: z.string().min(1).max(120),
});

export const updateConversationSchema = z
  .object({
    title: z.string().min(1).max(200),
    modelId: z.string().min(1).max(120),
    pinned: z.boolean(),
  })
  .partial();

export const createMessageSchema = z.object({
  role: z.enum(['USER', 'ASSISTANT', 'SYSTEM']),
  content: z.string().min(1),
  status: z.enum(['COMPLETE', 'STREAMING', 'ERROR', 'STOPPED']).default('COMPLETE'),
  modelId: z.string().max(120).optional(),
});

export const idParamSchema = z.object({ id: z.string().uuid() });
export const projectQuerySchema = z.object({ projectId: z.string().uuid() });
