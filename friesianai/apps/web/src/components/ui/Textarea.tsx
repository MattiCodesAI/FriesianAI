import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground',
        'placeholder:text-faint transition-colors duration-150 resize-none',
        'hover:border-border-strong focus:border-accent focus:outline-none',
        'focus:ring-2 focus:ring-accent/25',
        className,
      )}
      {...rest}
    />
  );
});
