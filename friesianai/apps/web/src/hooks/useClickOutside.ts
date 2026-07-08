import { useEffect, type RefObject } from 'react';

/** Invoke `handler` when a pointer event lands outside the referenced element. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: PointerEvent) => {
      const el = ref.current;
      if (el && event.target instanceof Node && !el.contains(event.target)) {
        handler();
      }
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref, handler, enabled]);
}
