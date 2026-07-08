import type { FileMeta, MemoryEntry, Note, PinnedPrompt } from '@/types';
import { SEED_FILES, SEED_MEMORIES, SEED_NOTES, SEED_PROMPTS } from '@/constants/seed';
import { LocalCollection } from './localCollection';
import { createId } from '@/utils/id';

/**
 * Repositories for workspace data that is not chat state.
 * MVP implementations are localStorage-backed; the server exposes the same
 * operations over HTTP (see apps/server/src/modules).
 */

const files = new LocalCollection<FileMeta>('files', SEED_FILES);
const notes = new LocalCollection<Note>('notes', SEED_NOTES);
const prompts = new LocalCollection<PinnedPrompt>('prompts', SEED_PROMPTS);
const memories = new LocalCollection<MemoryEntry>('memories', SEED_MEMORIES);

export const filesRepo = {
  listByProject: (projectId: string) => files.list((f) => f.projectId === projectId),
  add: (input: Omit<FileMeta, 'id' | 'createdAt' | 'indexed'>) =>
    files.insert({
      ...input,
      id: createId(),
      createdAt: new Date().toISOString(),
      indexed: false,
    }),
  remove: (id: string) => files.remove(id),
  listAll: () => files.list(),
};

export const notesRepo = {
  listByProject: (projectId: string) => notes.list((n) => n.projectId === projectId),
  create: (projectId: string, title: string, content = '') => {
    const now = new Date().toISOString();
    return notes.insert({ id: createId(), projectId, title, content, createdAt: now, updatedAt: now });
  },
  update: (id: string, patch: Partial<Pick<Note, 'title' | 'content'>>) =>
    notes.update(id, { ...patch, updatedAt: new Date().toISOString() }),
  remove: (id: string) => notes.remove(id),
  listAll: () => notes.list(),
};

export const promptsRepo = {
  listForProject: (projectId: string) =>
    prompts.list((p) => p.projectId === null || p.projectId === projectId),
  listAll: () => prompts.list(),
  create: (projectId: string | null, title: string, prompt: string) =>
    prompts.insert({ id: createId(), projectId, title, prompt, createdAt: new Date().toISOString() }),
  remove: (id: string) => prompts.remove(id),
};

/** Remove all workspace data owned by a project (used on project deletion). */
export async function purgeProjectData(projectId: string): Promise<void> {
  const [ownedFiles, ownedNotes, ownedPrompts, ownedMemories] = await Promise.all([
    files.list((f) => f.projectId === projectId),
    notes.list((n) => n.projectId === projectId),
    prompts.list((p) => p.projectId === projectId),
    memories.list((m) => m.projectId === projectId),
  ]);
  await Promise.all([
    ...ownedFiles.map((f) => files.remove(f.id)),
    ...ownedNotes.map((n) => notes.remove(n.id)),
    ...ownedPrompts.map((p) => prompts.remove(p.id)),
    ...ownedMemories.map((m) => memories.remove(m.id)),
  ]);
}

export const memoriesRepo = {
  /** Memories that apply to a chat: global ones plus the project's own. */
  listForContext: (projectId: string | null) =>
    memories.list((m) => m.projectId === null || m.projectId === projectId),
  listAll: () => memories.list(),
  create: (content: string, projectId: string | null = null) => {
    const now = new Date().toISOString();
    return memories.insert({ id: createId(), content, projectId, createdAt: now, updatedAt: now });
  },
  update: (id: string, content: string) =>
    memories.update(id, { content, updatedAt: new Date().toISOString() }),
  remove: (id: string) => memories.remove(id),
};
