import type { SearchResult } from '@/types';
import { useChatStore } from '@/store/chatStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { filesRepo, notesRepo } from './repositories';
import { matches, snippetAround, truncate } from '@/utils/text';

const LIMIT_PER_TYPE = 5;

/**
 * Global search across projects, conversations, messages, notes, and files.
 *
 * MVP: in-memory substring matching. The function signature (query → ranked
 * results) is what the future embedding-backed search on the server will
 * implement, so the command palette will not need to change.
 */
export async function searchWorkspace(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const { projects } = useWorkspaceStore.getState();
  const { conversations, messagesByConversation } = useChatStore.getState();
  const results: SearchResult[] = [];

  for (const project of projects) {
    if (results.length >= LIMIT_PER_TYPE) break;
    if (matches(project.name, q) || matches(project.description, q)) {
      results.push({
        type: 'project',
        id: project.id,
        title: project.name,
        snippet: truncate(project.description, 80) || undefined,
        projectId: project.id,
      });
    }
  }

  let convCount = 0;
  for (const conversation of conversations) {
    if (convCount >= LIMIT_PER_TYPE) break;
    if (matches(conversation.title, q)) {
      results.push({
        type: 'conversation',
        id: conversation.id,
        title: conversation.title,
        projectId: conversation.projectId ?? undefined,
        conversationId: conversation.id,
      });
      convCount += 1;
    }
  }

  let msgCount = 0;
  outer: for (const [conversationId, messages] of Object.entries(messagesByConversation)) {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) continue;
    for (const message of messages) {
      if (msgCount >= LIMIT_PER_TYPE) break outer;
      if (matches(message.content, q)) {
        results.push({
          type: 'message',
          id: message.id,
          title: conversation.title,
          snippet: snippetAround(message.content, q),
          projectId: conversation.projectId ?? undefined,
          conversationId,
        });
        msgCount += 1;
      }
    }
  }

  const [allNotes, allFiles] = await Promise.all([notesRepo.listAll(), filesRepo.listAll()]);

  for (const note of allNotes.slice(0, 200)) {
    if (matches(note.title, q) || matches(note.content, q)) {
      results.push({
        type: 'note',
        id: note.id,
        title: note.title,
        snippet: snippetAround(note.content, q),
        projectId: note.projectId,
      });
    }
  }

  for (const file of allFiles) {
    if (matches(file.name, q)) {
      results.push({ type: 'file', id: file.id, title: file.name, projectId: file.projectId });
    }
  }

  return results.slice(0, 20);
}
