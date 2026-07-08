/**
 * Model-provider abstraction.
 *
 * UI components never talk to a provider directly — they go through
 * `chatService`, which resolves the active model to a provider via the
 * registry. Adding a provider means adding one file under `providers/`
 * and registering it; no UI changes required.
 */

export type ProviderId = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'local';

export type ModelTier = 'fast' | 'balanced' | 'powerful';

export interface ModelInfo {
  /** Globally unique, e.g. "anthropic/claude-opus". */
  id: string;
  providerId: ProviderId;
  label: string;
  description: string;
  tier: ModelTier;
  contextWindow: number;
}

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChatParams {
  modelId: string;
  messages: ChatTurn[];
  /** Project-level instructions, prepended as system context. */
  systemPrompt?: string;
  signal?: AbortSignal;
}

export type StreamChunk =
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface ModelProvider {
  id: ProviderId;
  label: string;
  /** Docs / dashboard URL, shown in settings. */
  website: string;
  /** Whether this provider needs an API key before real calls can be made. */
  requiresApiKey: boolean;
  models: ModelInfo[];
  /**
   * Stream a chat completion. Implementations must respect `signal`
   * and yield `{ type: 'done' }` exactly once on success.
   */
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void>;
}
