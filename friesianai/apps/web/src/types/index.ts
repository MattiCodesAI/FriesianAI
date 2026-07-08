/**
 * Core domain types for FriesianAI.
 *
 * These types are the single source of truth for the shapes that flow through
 * stores, services, and components. Backend DTOs mirror these shapes
 * (see apps/server/src/modules/*) so the local repository layer can be swapped
 * for the HTTP API without touching UI code.
 */

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export type ProjectKind =
  | 'personal'
  | 'coding'
  | 'research'
  | 'business'
  | 'university'
  | 'sat'
  | 'fitness'
  | 'general';

export type ProjectColor =
  | 'blue'
  | 'violet'
  | 'green'
  | 'amber'
  | 'rose'
  | 'cyan'
  | 'orange'
  | 'slate';

export interface Project {
  id: string;
  name: string;
  kind: ProjectKind;
  color: ProjectColor;
  description: string;
  /** Free-form instructions injected as context for every chat in the project. */
  instructions: string;
  /** Preferred model for new chats in this project (falls back to the global default). */
  defaultModelId?: string;
  createdAt: string;
  updatedAt: string;
  /** Future-ready: unread activity indicator. */
  hasUnread: boolean;
}

// ---------------------------------------------------------------------------
// Conversations & messages
// ---------------------------------------------------------------------------

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'complete' | 'streaming' | 'error' | 'stopped';

/** Lightweight attachment metadata carried on a message. */
export interface MessageAttachment {
  id: string;
  name: string;
  kind: FileKind;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  /** Model that produced this message (assistant messages only). */
  modelId?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  /** null = a top-level chat that doesn't belong to any project. */
  projectId: string | null;
  title: string;
  modelId: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export type FileKind = 'pdf' | 'text' | 'markdown' | 'image' | 'other';

export interface FileMeta {
  id: string;
  projectId: string;
  name: string;
  kind: FileKind;
  mimeType: string;
  /** Size in bytes. */
  size: number;
  createdAt: string;
  /** Future-ready: set once the file has been embedded for semantic search. */
  indexed: boolean;
}

// ---------------------------------------------------------------------------
// Notes & pinned prompts
// ---------------------------------------------------------------------------

export interface Note {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * A long-term memory entry (Layer 4 of the FriesianAI architecture).
 * MVP: user-curated facts injected into every chat's system context.
 * Future: confidence, versioning, sensitivity levels, semantic retrieval.
 */
export interface MemoryEntry {
  id: string;
  content: string;
  /** null = global memory; otherwise scoped to a project. */
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PinnedPrompt {
  id: string;
  /** null = available in every project. */
  projectId: string | null;
  title: string;
  prompt: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export type SearchResultType = 'project' | 'conversation' | 'message' | 'note' | 'file';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  snippet?: string;
  projectId?: string;
  conversationId?: string;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export type Theme = 'dark' | 'light' | 'system';
