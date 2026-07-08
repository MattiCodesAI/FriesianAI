import type { ModelProvider, ProviderId } from './types.js';
import { echoProvider } from './providers/echo.js';

/**
 * Provider registry. Model ids are "provider/model", so routing a request
 * means splitting on the first slash and looking the provider up here.
 * All providers currently resolve to the dev echo provider.
 */
const providers: Record<ProviderId, ModelProvider> = {
  openai: echoProvider,
  anthropic: echoProvider,
  google: echoProvider,
  openrouter: echoProvider,
  local: echoProvider,
};

export function providerForModel(modelId: string): ModelProvider | undefined {
  const providerId = modelId.split('/')[0] as ProviderId | undefined;
  return providerId ? providers[providerId] : undefined;
}
