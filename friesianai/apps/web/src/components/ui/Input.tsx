import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-8 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground',
        'placeholder:text-faint transition-colors duration-150',
        'hover:border-border-strong focus:border-accent focus:outline-none',
        'focus:ring-2 focus:ring-accent/25',
        className,
      )}
      {...rest}
    />
  );
});
