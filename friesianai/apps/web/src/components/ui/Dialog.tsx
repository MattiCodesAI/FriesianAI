import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IconButton } from './IconButton';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Max width utility class, defaults to a comfortable dialog width. */
  widthClass?: string;
}

/**
 * Modal dialog: portal, scrim, Escape/overlay close, entry animation.
 * Content is unmounted when closed.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  widthClass = 'max-w-md',
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={cn(
              'relative w-full rounded-xl border border-border bg-surface-raised shadow-overlay',
              widthClass,
            )}
          >
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                  {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
                  {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
                </div>
                <IconButton label="Close" size="sm" hideTooltip onClick={onClose}>
                  <X className="size-4" />
                </IconButton>
              </div>
            )}
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
