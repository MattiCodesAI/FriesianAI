import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useClickOutside } from '@/hooks/useClickOutside';

interface DropdownContextValue {
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

interface DropdownMenuProps {
  /** Render prop for the trigger; receives open state. */
  trigger: (open: boolean) => ReactNode;
  children: ReactNode;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  menuClassName?: string;
}

/** Lightweight dropdown menu with outside-click and Escape handling. */
export function DropdownMenu({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  menuClassName,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(rootRef, close, open);

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          close();
        }
      }}
    >
      <div onClick={() => setOpen((v) => !v)} className="inline-flex cursor-pointer">
        {trigger(open)}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: side === 'bottom' ? -4 : 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: side === 'bottom' ? -4 : 4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={cn(
              'absolute z-40 min-w-44 overflow-hidden rounded-lg border border-border',
              'bg-surface-raised p-1 shadow-raised',
              side === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
              align === 'start' ? 'left-0' : 'right-0',
              menuClassName,
            )}
          >
            <DropdownContext.Provider value={{ close }}>{children}</DropdownContext.Provider>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MenuItemProps {
  onSelect?: () => void;
  icon?: ReactNode;
  selected?: boolean;
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

export function MenuItem({ onSelect, icon, selected, danger, disabled, children }: MenuItemProps) {
  const ctx = useContext(DropdownContext);
  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        onSelect?.();
        ctx?.close();
      }}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
        'text-foreground hover:bg-surface-hover disabled:opacity-50 cursor-pointer',
        danger && 'text-danger hover:bg-danger-soft',
      )}
    >
      {icon && <span className="text-muted [&>svg]:size-4">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {selected && <Check className="size-3.5 text-accent" />}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-border" role="separator" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
      {children}
    </div>
  );
}
