import { useRef } from 'react';
import { cn } from '@/utils/cn';

interface ResizeHandleProps {
  /** Current size of the panel being resized. */
  value: number;
  onChange: (next: number) => void;
  /** 1 = dragging right grows the panel (left sidebar); -1 = inverse (right panel). */
  direction: 1 | -1;
  ariaLabel: string;
}

/** Thin draggable divider between panels. */
export function ResizeHandle({ value, onChange, direction, ariaLabel }: ResizeHandleProps) {
  const dragState = useRef<{ startX: number; startValue: number } | null>(null);

  return (
    <div
      role="separator"
      aria-label={ariaLabel}
      aria-orientation="vertical"
      onPointerDown={(event) => {
        dragState.current = { startX: event.clientX, startValue: value };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const drag = dragState.current;
        if (!drag) return;
        onChange(drag.startValue + direction * (event.clientX - drag.startX));
      }}
      onPointerUp={(event) => {
        dragState.current = null;
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      className={cn(
        'group relative z-10 -mx-px w-0.5 shrink-0 cursor-col-resize select-none touch-none',
        'after:absolute after:inset-y-0 after:-inset-x-1 after:content-[""]',
      )}
    >
      <div className="h-full w-full bg-transparent transition-colors duration-150 group-hover:bg-accent/50 group-active:bg-accent" />
    </div>
  );
}
