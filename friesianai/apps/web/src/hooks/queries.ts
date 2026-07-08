import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FileMeta, Note } from '@/types';
import { filesRepo, memoriesRepo, notesRepo, promptsRepo } from '@/services/repositories';

/**
 * Server-state hooks. React Query fronts the repository layer so the app
 * already has caching/invalidation semantics in place for the real API.
 *
 * Invalidation uses root keys (e.g. ['files']) so both project-scoped and
 * workspace-wide views refresh after any mutation.
 */

export const queryKeys = {
  files: ['files'] as const,
  projectFiles: (projectId: string) => ['files', projectId] as const,
  notes: ['notes'] as const,
  projectNotes: (projectId: string) => ['notes', projectId] as const,
  prompts: ['prompts'] as const,
  memories: ['memories'] as const,
};

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export function useProjectFiles(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectFiles(projectId),
    queryFn: () => filesRepo.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAllFiles() {
  return useQuery({ queryKey: queryKeys.files, queryFn: () => filesRepo.listAll() });
}

export function useAddFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<FileMeta, 'id' | 'createdAt' | 'indexed'>) => filesRepo.add(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.files }),
  });
}

export function useRemoveFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesRepo.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.files }),
  });
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export function useProjectNotes(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectNotes(projectId),
    queryFn: () => notesRepo.listByProject(projectId),
    enabled: Boolean(projectId),
  });
}

export function useAllNotes() {
  return useQuery({ queryKey: queryKeys.notes, queryFn: () => notesRepo.listAll() });
}

export function useCreateNote(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, content }: { title: string; content?: string }) =>
      notesRepo.create(projectId, title, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string } & Partial<Pick<Note, 'title' | 'content'>>) =>
      notesRepo.update(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
  });
}

export function useRemoveNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesRepo.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notes }),
  });
}

// ---------------------------------------------------------------------------
// Pinned prompts
// ---------------------------------------------------------------------------

export function useAllPrompts() {
  return useQuery({ queryKey: queryKeys.prompts, queryFn: () => promptsRepo.listAll() });
}

// ---------------------------------------------------------------------------
// Memories
// ---------------------------------------------------------------------------

export function useMemories() {
  return useQuery({ queryKey: queryKeys.memories, queryFn: () => memoriesRepo.listAll() });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, projectId }: { content: string; projectId?: string | null }) =>
      memoriesRepo.create(content, projectId ?? null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.memories }),
  });
}

export function useUpdateMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      memoriesRepo.update(id, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.memories }),
  });
}

export function useRemoveMemory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => memoriesRepo.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.memories }),
  });
}
