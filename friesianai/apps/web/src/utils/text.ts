/** Truncate a string on a word boundary where possible. */
export function truncate(value: string, max: number): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

/** Derive a conversation title from the first user message. */
export function deriveTitle(firstMessage: string): string {
  return truncate(firstMessage, 48) || 'New chat';
}

/** Case-insensitive containment check used by client-side search. */
export function matches(haystack: string, query: string): boolean {
  return haystack.toLowerCase().includes(query.toLowerCase());
}

/** Extract a short snippet around the first match of `query`. */
export function snippetAround(text: string, query: string, radius = 60): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return truncate(text, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${suffix}`;
}
