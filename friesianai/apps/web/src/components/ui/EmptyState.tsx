import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty state used across panels, lists, and error screens. */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex flex-col items-center justify-center px-6 py-10 text-center', className)}
    >
      {icon && (
        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-surface-active text-muted [&>svg]:size-5">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-60 text-xs leading-5 text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
