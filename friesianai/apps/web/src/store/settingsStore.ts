import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '@/types';
import type { ProviderId } from '@/services/ai/types';
import { DEFAULT_MODEL_ID } from '@/constants/models';

interface SettingsState {
  theme: Theme;
  defaultModelId: string;
  /** Send on Enter (Shift+Enter for newline) vs. Ctrl/Cmd+Enter. */
  sendOnEnter: boolean;
  reducedMotion: boolean;
  /** Placeholder API key storage; real deployments keep keys server-side. */
  apiKeys: Partial<Record<ProviderId, string>>;

  setTheme: (theme: Theme) => void;
  setDefaultModelId: (modelId: string) => void;
  setSendOnEnter: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setApiKey: (provider: ProviderId, key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      defaultModelId: DEFAULT_MODEL_ID,
      sendOnEnter: true,
      reducedMotion: false,
      apiKeys: {},

      setTheme: (theme) => set({ theme }),
      setDefaultModelId: (defaultModelId) => set({ defaultModelId }),
      setSendOnEnter: (sendOnEnter) => set({ sendOnEnter }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setApiKey: (provider, key) =>
        set((state) => ({ apiKeys: { ...state.apiKeys, [provider]: key } })),
    }),
    { name: 'friesian:settings' },
  ),
);

/** Resolve the effective theme, expanding "system" to the OS preference. */
export function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}
