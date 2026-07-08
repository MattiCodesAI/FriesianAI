import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText,
  Folder,
  FolderPlus,
  MessageSquare,
  MessageSquarePlus,
  NotebookPen,
  PanelRight,
  Search,
  Settings,
  Text,
} from 'lucide-react';
import type { SearchResult, SearchResultType } from '@/types';
import { Kbd } from '@/components/ui/Kbd';
import { Spinner } from '@/components/ui/Spinner';
import { searchWorkspace } from '@/services/searchService';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';

const typeIcon: Record<SearchResultType, typeof Folder> = {
  project: Folder,
  conversation: MessageSquare,
  message: Text,
  note: NotebookPen,
  file: FileText,
};

const typeLabel: Record<SearchResultType, string> = {
  project: 'Project',
  conversation: 'Chat',
  message: 'Message',
  note: 'Note',
  file: 'File',
};

interface CommandAction {
  id: string;
  label: string;
  icon: typeof Folder;
  run: () => void;
}

/**
 * Command palette (⌘K): global search across the workspace plus quick actions.
 * Search goes through searchService, which the future semantic backend will
 * implement behind the same signature.
 */
export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setCreateProjectOpen = useUiStore((s) => s.setCreateProjectOpen);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: CommandAction[] = [
    {
      id: 'new-chat',
      label: 'New chat',
      icon: MessageSquarePlus,
      run: () => navigate('/'),
    },
    {
      id: 'open-workspace',
      label: 'Open workspace',
      icon: PanelRight,
      run: () => useUiStore.getState().setWorkspaceOpen(true),
    },
    {
      id: 'new-project',
      label: 'New project',
      icon: FolderPlus,
      run: () => setCreateProjectOpen(true),
    },
    {
      id: 'settings',
      label: 'Open settings',
      icon: Settings,
      run: () => navigate('/settings'),
    },
  ];

  const showActions = query.trim().length < 2;
  const itemCount = showActions ? actions.length : results.length;

  // Reset on open; focus input.
  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      void searchWorkspace(query).then((found) => {
        setResults(found);
        setSelectedIndex(0);
        setSearching(false);
      });
    }, 160);
    return () => window.clearTimeout(timer);
  }, [query]);

  const openResult = (result: SearchResult) => {
    switch (result.type) {
      case 'project':
        useUiStore.getState().openWorkspaceAt('projects');
        break;
      case 'conversation':
      case 'message':
        if (result.conversationId) navigate(`/c/${result.conversationId}`);
        break;
      case 'note':
        useUiStore.getState().openWorkspaceAt('notes');
        break;
      case 'file':
        useUiStore.getState().openWorkspaceAt('files');
        break;
    }
    setOpen(false);
  };

  const activate = (index: number) => {
    if (showActions) {
      actions[index]?.run();
      setOpen(false);
    } else {
      const result = results[index];
      if (result) openResult(result);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface-raised shadow-overlay"
          >
            {/* Input */}
            <div className="flex items-center gap-2.5 border-b border-border px-4">
              <Search className="size-4 shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex((i) => Math.min(i + 1, Math.max(0, itemCount - 1)));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex((i) => Math.max(i - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    activate(selectedIndex);
                  }
                }}
                placeholder="Search chats, projects, notes, files…"
                className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-faint"
              />
              {searching ? <Spinner className="size-3.5" /> : <Kbd>esc</Kbd>}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-1.5">
              {showActions ? (
                <>
                  <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
                    Quick actions
                  </p>
                  {actions.map((action, index) => (
                    <button
                      key={action.id}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => activate(index)}
                      className={cn(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors cursor-pointer',
                        index === selectedIndex
                          ? 'bg-surface-hover text-foreground'
                          : 'text-muted',
                      )}
                    >
                      <action.icon className="size-4 text-muted" />
                      {action.label}
                    </button>
                  ))}
                </>
              ) : results.length === 0 && !searching ? (
                <p className="px-3 py-8 text-center text-sm text-muted">
                  No results for “{query}”
                </p>
              ) : (
                results.map((result, index) => {
                  const Icon = typeIcon[result.type];
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => activate(index)}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer',
                        index === selectedIndex ? 'bg-surface-hover' : '',
                      )}
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-foreground">
                          {result.title}
                        </span>
                        {result.snippet && (
                          <span className="block truncate text-xs text-faint">
                            {result.snippet}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-faint">
                        {typeLabel[result.type]}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
