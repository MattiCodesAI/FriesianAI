import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent text-on-accent hover:bg-accent-hover border border-transparent shadow-soft',
  secondary:
    'bg-surface-raised text-foreground border border-border hover:bg-surface-hover hover:border-border-strong',
  ghost: 'bg-transparent text-muted hover:text-foreground hover:bg-surface-hover border border-transparent',
  danger: 'bg-danger-soft text-danger border border-transparent hover:bg-danger hover:text-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  md: 'h-8 px-3 text-sm gap-2 rounded-lg',
  lg: 'h-10 px-4 text-sm gap-2 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', loading = false, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-ring disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer',
        'active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
