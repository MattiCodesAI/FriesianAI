import type { ModelProvider, StreamChatParams, StreamChunk } from '../types';
import { modelsForProvider } from '@/constants/models';
import { simulateStream } from '../simulatedStream';

/**
 * Local models provider (Ollama / llama.cpp).
 * No API key needed; go-live means streaming from http://localhost:11434.
 */
export const localProvider: ModelProvider = {
  id: 'local',
  label: 'Local',
  website: 'https://ollama.com',
  requiresApiKey: false,
  models: modelsForProvider('local'),
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void> {
    return simulateStream(params, 'local runtime');
  },
};
