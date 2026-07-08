import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-raised shadow-soft',
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pt-4 pb-2', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-sm font-semibold text-foreground', className)} {...rest} />;
}

export function CardContent({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 pb-4', className)} {...rest} />;
}
