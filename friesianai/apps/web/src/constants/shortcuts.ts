export interface ShortcutDef {
  id: string;
  /** Display keys; "mod" renders as ⌘ on macOS and Ctrl elsewhere. */
  keys: string[];
  label: string;
}

export const SHORTCUTS: ShortcutDef[] = [
  { id: 'command-palette', keys: ['mod', 'K'], label: 'Search & command palette' },
  { id: 'new-chat', keys: ['mod', 'N'], label: 'New chat' },
  { id: 'new-project', keys: ['mod', 'shift', 'P'], label: 'New project' },
  { id: 'focus-input', keys: ['mod', '/'], label: 'Focus chat input' },
  { id: 'toggle-sidebar', keys: ['mod', 'B'], label: 'Toggle sidebar' },
  { id: 'toggle-workspace', keys: ['mod', '.'], label: 'Open / close workspace' },
  { id: 'escape', keys: ['esc'], label: 'Close dialogs and menus' },
];

export const IS_MAC =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Render a key token for display ("mod" → ⌘ / Ctrl). */
export function keyLabel(key: string): string {
  switch (key) {
    case 'mod':
      return IS_MAC ? '⌘' : 'Ctrl';
    case 'shift':
      return IS_MAC ? '⇧' : 'Shift';
    case 'alt':
      return IS_MAC ? '⌥' : 'Alt';
    case 'esc':
      return 'Esc';
    case 'enter':
      return '↵';
    default:
      return key.toUpperCase();
  }
}
