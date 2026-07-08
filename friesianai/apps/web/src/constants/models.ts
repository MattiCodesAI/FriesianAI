import type { ModelInfo, ProviderId } from '@/services/ai/types';

/**
 * Model catalog. This is presentation metadata only — provider behavior lives
 * in `services/ai/providers/*`. Update freely as vendors ship new models.
 */
export const MODELS: ModelInfo[] = [
  // Anthropic
  {
    id: 'anthropic/claude-opus',
    providerId: 'anthropic',
    label: 'Claude Opus',
    description: 'Deep reasoning for the hardest problems',
    tier: 'powerful',
    contextWindow: 200_000,
  },
  {
    id: 'anthropic/claude-sonnet',
    providerId: 'anthropic',
    label: 'Claude Sonnet',
    description: 'Best balance of intelligence and speed',
    tier: 'balanced',
    contextWindow: 200_000,
  },
  {
    id: 'anthropic/claude-haiku',
    providerId: 'anthropic',
    label: 'Claude Haiku',
    description: 'Near-instant responses',
    tier: 'fast',
    contextWindow: 200_000,
  },
  // OpenAI
  {
    id: 'openai/gpt-5',
    providerId: 'openai',
    label: 'GPT-5',
    description: 'OpenAI flagship model',
    tier: 'powerful',
    contextWindow: 256_000,
  },
  {
    id: 'openai/gpt-5-mini',
    providerId: 'openai',
    label: 'GPT-5 Mini',
    description: 'Fast and cost-efficient',
    tier: 'fast',
    contextWindow: 128_000,
  },
  // Google
  {
    id: 'google/gemini-pro',
    providerId: 'google',
    label: 'Gemini Pro',
    description: 'Long-context multimodal reasoning',
    tier: 'powerful',
    contextWindow: 1_000_000,
  },
  {
    id: 'google/gemini-flash',
    providerId: 'google',
    label: 'Gemini Flash',
    description: 'Low latency, high throughput',
    tier: 'fast',
    contextWindow: 1_000_000,
  },
  // OpenRouter
  {
    id: 'openrouter/auto',
    providerId: 'openrouter',
    label: 'OpenRouter Auto',
    description: 'Routes each request to the best available model',
    tier: 'balanced',
    contextWindow: 128_000,
  },
  // Local
  {
    id: 'local/llama',
    providerId: 'local',
    label: 'Llama (local)',
    description: 'Runs on your machine via Ollama',
    tier: 'balanced',
    contextWindow: 32_000,
  },
  {
    id: 'local/qwen-coder',
    providerId: 'local',
    label: 'Qwen Coder (local)',
    description: 'Local coding specialist',
    tier: 'fast',
    contextWindow: 32_000,
  },
];

export const DEFAULT_MODEL_ID = 'anthropic/claude-sonnet';

export function getModel(modelId: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === modelId);
}

export function modelsForProvider(providerId: ProviderId): ModelInfo[] {
  return MODELS.filter((m) => m.providerId === providerId);
}
