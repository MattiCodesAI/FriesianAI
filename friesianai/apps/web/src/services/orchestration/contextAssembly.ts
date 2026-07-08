import type { Conversation } from '@/types';
import { memoriesRepo } from '@/services/repositories';
import { useWorkspaceStore } from '@/store/workspaceStore';

/**
 * Context assembly — the first piece of the Orchestration Engine (Layer 2).
 *
 * Builds the system context for a chat turn from everything FriesianAI knows:
 * project instructions and long-term memories today; knowledge retrieval
 * (RAG), planning state, and integration context plug in here later without
 * the chat store or providers changing.
 */
export async function assembleSystemPrompt(
  conversation: Conversation,
): Promise<string | undefined> {
  const parts: string[] = [];

  if (conversation.projectId) {
    const project = useWorkspaceStore
      .getState()
      .projects.find((p) => p.id === conversation.projectId);
    if (project?.instructions.trim()) {
      parts.push(`Project instructions (${project.name}):\n${project.instructions.trim()}`);
    }
  }

  const memories = await memoriesRepo.listForContext(conversation.projectId);
  if (memories.length > 0) {
    parts.push(
      `Things to remember about the user:\n${memories.map((m) => `- ${m.content}`).join('\n')}`,
    );
  }

  return parts.length > 0 ? parts.join('\n\n') : undefined;
}
