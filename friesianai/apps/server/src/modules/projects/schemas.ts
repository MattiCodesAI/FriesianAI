import { z } from 'zod';

export const projectKind = z.enum([
  'PERSONAL',
  'CODING',
  'RESEARCH',
  'BUSINESS',
  'UNIVERSITY',
  'SAT',
  'FITNESS',
  'GENERAL',
]);

export const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  kind: projectKind.default('GENERAL'),
  color: z.string().max(24).default('blue'),
  description: z.string().max(2000).default(''),
});

export const updateProjectSchema = createProjectSchema
  .extend({ instructions: z.string().max(8000) })
  .partial();

export const idParamSchema = z.object({ id: z.string().uuid() });
