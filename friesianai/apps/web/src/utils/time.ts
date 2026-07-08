const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "just now", "5m ago", "3h ago", "2d ago", or a short date. */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const delta = Date.now() - then;

  if (delta < MINUTE) return 'just now';
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < 7 * DAY) return `${Math.floor(delta / DAY)}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** "3:42 PM" style timestamp for message rows. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** "Jan 4, 2026" style date. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export type DateGroup = 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older';

const DATE_GROUP_ORDER: DateGroup[] = ['Today', 'Yesterday', 'Previous 7 days', 'Older'];

function dateGroupOf(iso: string): DateGroup {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const time = date.getTime();

  if (time >= startOfToday) return 'Today';
  if (time >= startOfToday - DAY) return 'Yesterday';
  if (time >= startOfToday - 7 * DAY) return 'Previous 7 days';
  return 'Older';
}

/** Group items by recency buckets (Today / Yesterday / …), preserving order. */
export function groupByDate<T>(items: T[], getIso: (item: T) => string): Array<[DateGroup, T[]]> {
  const buckets = new Map<DateGroup, T[]>();
  for (const item of items) {
    const group = dateGroupOf(getIso(item));
    const bucket = buckets.get(group);
    if (bucket) bucket.push(item);
    else buckets.set(group, [item]);
  }
  return DATE_GROUP_ORDER.filter((g) => buckets.has(g)).map((g) => [g, buckets.get(g) ?? []]);
}

/** Human-readable byte size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
