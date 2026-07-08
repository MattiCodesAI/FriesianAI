import { useLayoutEffect, type RefObject } from 'react';

/** Grow a textarea with its content, up to maxHeight pixels. */
export function useAutosizeTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 240,
): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [ref, value, maxHeight]);
}
