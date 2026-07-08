import { cn } from '@/utils/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Initials avatar; swap in an image source when auth/profiles arrive. */
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      aria-label={name}
      className={cn(
        'flex items-center justify-center rounded-full bg-accent-soft text-accent font-semibold select-none',
        size === 'sm' ? 'size-6 text-[10px]' : 'size-8 text-xs',
        className,
      )}
    >
      {initials || '?'}
    </div>
  );
}
