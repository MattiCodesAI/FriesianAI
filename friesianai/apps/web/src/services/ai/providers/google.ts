import type { ModelProvider, StreamChatParams, StreamChunk } from '../types';
import { modelsForProvider } from '@/constants/models';
import { simulateStream } from '../simulatedStream';

/** Google (Gemini) provider — simulated in the MVP. */
export const googleProvider: ModelProvider = {
  id: 'google',
  label: 'Google',
  website: 'https://ai.google.dev',
  requiresApiKey: true,
  models: modelsForProvider('google'),
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void> {
    return simulateStream(params, 'Google AI');
  },
};
