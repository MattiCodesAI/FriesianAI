import { useId, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: Array<TabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Underline-style tab bar with an animated active indicator. */
export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  const indicatorId = useId();
  return (
    <div role="tablist" className={cn('flex items-center gap-1 border-b border-border', className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer',
              active ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {item.icon && <span className="[&>svg]:size-3.5">{item.icon}</span>}
            {item.label}
            {active && (
              <motion.span
                layoutId={indicatorId}
                className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
