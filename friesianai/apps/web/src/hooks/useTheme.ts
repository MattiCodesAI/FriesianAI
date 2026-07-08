import { useEffect } from 'react';
import { resolveTheme, useSettingsStore } from '@/store/settingsStore';

/** Applies the selected theme to <html> and tracks OS preference for "system". */
export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark');
    };
    apply();

    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
