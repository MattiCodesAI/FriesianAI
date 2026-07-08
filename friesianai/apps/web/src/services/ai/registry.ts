import type { ModelProvider, ProviderId } from './types';
import { anthropicProvider } from './providers/anthropic';
import { googleProvider } from './providers/google';
import { localProvider } from './providers/local';
import { openaiProvider } from './providers/openai';
import { openrouterProvider } from './providers/openrouter';
import { getModel } from '@/constants/models';

/**
 * Provider registry — the only place that knows every provider.
 * To add a provider: create `providers/<name>.ts`, add its models to the
 * catalog, and register it here.
 */
const providers: Record<ProviderId, ModelProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  google: googleProvider,
  openrouter: openrouterProvider,
  local: localProvider,
};

export function getProvider(id: ProviderId): ModelProvider {
  return providers[id];
}

export function listProviders(): ModelProvider[] {
  return Object.values(providers);
}

export function providerForModel(modelId: string): ModelProvider | undefined {
  const model = getModel(modelId);
  return model ? providers[model.providerId] : undefined;
}
