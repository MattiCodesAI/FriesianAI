import type { ModelProvider, StreamChatParams, StreamChunk } from '../types';
import { modelsForProvider } from '@/constants/models';
import { simulateStream } from '../simulatedStream';

/**
 * OpenAI provider.
 *
 * MVP: streams a locally simulated response. To go live, replace `streamChat`
 * with a call to the FriesianAI API (`POST /api/chat`) which holds the key
 * server-side — or call OpenAI's SDK directly for a fully local setup.
 */
export const openaiProvider: ModelProvider = {
  id: 'openai',
  label: 'OpenAI',
  website: 'https://platform.openai.com',
  requiresApiKey: true,
  models: modelsForProvider('openai'),
  streamChat(params: StreamChatParams): AsyncGenerator<StreamChunk, void, void> {
    return simulateStream(params, 'OpenAI');
  },
};
