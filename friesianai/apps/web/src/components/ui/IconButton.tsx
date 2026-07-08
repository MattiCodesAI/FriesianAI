import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Tooltip } from './Tooltip';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: 'sm' | 'md';
  active?: boolean;
  /** Hide the tooltip (e.g. when the button already has visible text nearby). */
  hideTooltip?: boolean;
}

/** Square icon-only button with a built-in accessible label + tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = 'md', active = false, hideTooltip = false, className, children, ...rest },
  ref,
) {
  const button = (
    <button
      ref={ref}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors duration-150',
        'text-muted hover:text-foreground hover:bg-surface-hover focus-ring cursor-pointer',
        'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.96] select-none',
        size === 'sm' ? 'size-6' : 'size-8',
        active && 'bg-surface-active text-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );

  if (hideTooltip) return button;
  return <Tooltip content={label}>{button}</Tooltip>;
});
