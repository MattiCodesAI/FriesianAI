/**
 * Server-side model provider abstraction — mirrors the frontend contract in
 * apps/web/src/services/ai/types.ts. Real providers (OpenAI, Anthropic,
 * Google, OpenRouter, local runtimes) implement `streamChat` here with the
 * vendor SDK / HTTP API, keeping keys server-side.
 */

export type ProviderId = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'local';

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamChatParams {
  modelId: string;
  messages: ChatTurn[];
  systemPrompt?: string;
  signal?: AbortSignal;
}

export type StreamChunk =
  | { type: 'delta'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface ModelProvider {
  id: ProviderId;
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void>;
}
