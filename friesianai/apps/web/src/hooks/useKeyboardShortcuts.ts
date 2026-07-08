import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import { focusChatInput } from '@/utils/focus';

/**
 * Global keyboard shortcuts. Registered once in the app shell.
 * The definitions shown in Settings live in constants/shortcuts.ts.
 */
export function useKeyboardShortcuts(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      const ui = useUiStore.getState();

      if (mod && key === 'k') {
        event.preventDefault();
        ui.setCommandPaletteOpen(!ui.commandPaletteOpen);
        return;
      }

      if (mod && key === 'n') {
        event.preventDefault();
        navigate('/');
        return;
      }

      if (mod && event.shiftKey && key === 'p') {
        event.preventDefault();
        ui.setCreateProjectOpen(true);
        return;
      }

      if (mod && key === '/') {
        event.preventDefault();
        focusChatInput();
        return;
      }

      if (mod && key === 'b') {
        event.preventDefault();
        ui.toggleSidebar();
        return;
      }

      if (mod && key === '.') {
        event.preventDefault();
        ui.toggleWorkspace();
        return;
      }

      if (event.key === 'Escape') {
        // Dialogs handle their own Escape; this catches the palette overlay.
        if (ui.commandPaletteOpen) ui.setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate]);
}
