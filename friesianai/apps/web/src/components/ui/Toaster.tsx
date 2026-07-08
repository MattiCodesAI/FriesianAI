import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastVariant } from '@/store/toastStore';
import { cn } from '@/utils/cn';

const icons: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  error: AlertCircle,
};

const iconColor: Record<ToastVariant, string> = {
  default: 'text-accent',
  success: 'text-success',
  error: 'text-danger',
};

/** Fixed toast stack; render once in the app shell. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border',
                'bg-surface-raised px-3 py-2.5 shadow-raised',
              )}
            >
              <Icon className={cn('mt-0.5 size-4 shrink-0', iconColor[toast.variant])} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{toast.title}</p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-4 text-muted">{toast.description}</p>
                )}
              </div>
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(toast.id)}
                className="rounded p-0.5 text-faint transition-colors hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
