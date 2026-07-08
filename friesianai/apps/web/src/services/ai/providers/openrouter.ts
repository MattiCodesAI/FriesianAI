import type { ModelProvider, StreamChatParams, StreamChunk } from '../types';
import { modelsForProvider } from '@/constants/models';
import { simulateStream } from '../simulatedStream';

/** OpenRouter provider — one key, many models. Simulated in the MVP. */
export const openrouterProvider: ModelProvider = {
  id: 'openrouter',
  label: 'OpenRouter',
  website: 'https://openrouter.ai',
  requiresApiKey: true,
  models: modelsForProvider('openrouter'),
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void> {
    return simulateStream(params, 'OpenRouter');
  },
};
