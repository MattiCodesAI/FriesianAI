import type { ModelProvider, StreamChatParams, StreamChunk } from '../types';
import { modelsForProvider } from '@/constants/models';
import { simulateStream } from '../simulatedStream';

/** Anthropic provider — simulated in the MVP; see openai.ts for the go-live path. */
export const anthropicProvider: ModelProvider = {
  id: 'anthropic',
  label: 'Anthropic',
  website: 'https://console.anthropic.com',
  requiresApiKey: true,
  models: modelsForProvider('anthropic'),
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void> {
    return simulateStream(params, 'Anthropic');
  },
};
