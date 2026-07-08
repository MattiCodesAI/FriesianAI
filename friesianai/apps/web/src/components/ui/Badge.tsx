import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-surface-active text-muted',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger-soft text-danger',
  outline: 'border border-border text-muted',
};

export function Badge({ variant = 'default', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-4',
        variantClasses[variant],
        className,
      )}
      {...rest}
    />
  );
}
