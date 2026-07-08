import type { Message } from '@/types';
import type { ChatTurn, StreamChatParams, StreamChunk } from './types';
import { providerForModel } from './registry';

/**
 * Facade the UI talks to. Components and stores never import providers —
 * they hand this service a model id and message history and consume a stream.
 */

export function toChatTurns(messages: Message[]): ChatTurn[] {
  return messages
    .filter((m) => m.status === 'complete' || m.status === 'stopped')
    .map((m) => ({ role: m.role, content: m.content }));
}

export async function* streamChat(
  params: StreamChatParams,
): AsyncGenerator<StreamChunk, void, void> {
  const provider = providerForModel(params.modelId);
  if (!provider) {
    yield { type: 'error', message: `Unknown model: ${params.modelId}` };
    return;
  }
  yield* provider.streamChat(params);
}
