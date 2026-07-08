import type { ModelProvider, StreamChatParams, StreamChunk } from '../types.js';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Development provider: streams a canned response so the end-to-end SSE
 * pipeline can be exercised without any vendor account. Replace per-provider
 * by adding openai.ts / anthropic.ts / … and registering them.
 */
export const echoProvider: ModelProvider = {
  id: 'local',
  async *streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void> {
    const lastUser = [...params.messages].reverse().find((m) => m.role === 'user');
    const text = `(dev echo from ${params.modelId}) You said: ${lastUser?.content ?? '…'}`;
    for (const token of text.match(/\s*\S+/g) ?? []) {
      if (params.signal?.aborted) return;
      yield { type: 'delta', text: token };
      await sleep(20);
    }
    yield { type: 'done' };
  },
};
