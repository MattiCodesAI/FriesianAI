import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { IconButton } from '@/components/ui/IconButton';
import { Tooltip } from '@/components/ui/Tooltip';
import { WORKSPACE_SECTIONS } from './sections';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';

/**
 * The workspace: a slide-in surface for everything that isn't chat.
 * Hidden by default, resizable, closable — lazy-loaded so the chat
 * experience never pays for it.
 */
export default function WorkspacePanel() {
  const width = useUiStore((s) => s.workspaceWidth);
  const section = useUiStore((s) => s.workspaceSection);
  const setSection = useUiStore((s) => s.setWorkspaceSection);
  const setWorkspaceOpen = useUiStore((s) => s.setWorkspaceOpen);

  const active = WORKSPACE_SECTIONS.find((s) => s.id === section) ?? WORKSPACE_SECTIONS[0]!;
  const ActiveComponent = active.component;

  return (
    <motion.aside
      aria-label="Workspace"
      initial={{ x: 48, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 48, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      style={{ width }}
      className="flex h-full shrink-0 overflow-hidden bg-surface-sunken"
    >
      {/* Section rail */}
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-border/40 py-2">
        {WORKSPACE_SECTIONS.map(({ id, label, icon: Icon }) => (
          <Tooltip key={id} content={label} side="right">
            <button
              aria-label={label}
              aria-pressed={id === active.id}
              onClick={() => setSection(id)}
              className={cn(
                'flex size-8 items-center justify-center rounded-lg transition-colors duration-100 cursor-pointer',
                id === active.id
                  ? 'bg-surface-active text-foreground'
                  : 'text-faint hover:bg-surface-hover hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
            </button>
          </Tooltip>
        ))}
      </div>

      {/* Section content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-13 shrink-0 items-center justify-between pl-4 pr-2">
          <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
            {active.label}
          </h2>
          <IconButton label="Close workspace" size="sm" onClick={() => setWorkspaceOpen(false)}>
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ErrorBoundary region="workspace panel">
            <ActiveComponent />
          </ErrorBoundary>
        </div>
      </div>
    </motion.aside>
  );
}
