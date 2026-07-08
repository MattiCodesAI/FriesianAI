import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface TooltipProps {
  content: ReactNode;
  side?: 'top' | 'bottom' | 'right' | 'left';
  children: ReactNode;
  /** Delay before showing, in ms. */
  delay?: number;
}

const sideClasses: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
};

export function Tooltip({ content, side = 'top', children, delay = 350 }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Clear any pending timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const show = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setOpen(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border',
              'bg-surface-raised px-2 py-1 text-xs text-foreground shadow-raised',
              sideClasses[side],
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
