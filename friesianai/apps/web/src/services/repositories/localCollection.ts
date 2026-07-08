/**
 * Tiny localStorage-backed collection used by the MVP repositories.
 *
 * Deliberately async: repository consumers (React Query hooks) never know
 * whether data comes from localStorage or the HTTP API, so the storage layer
 * can be swapped without touching UI code.
 */

function storageKey(name: string): string {
  return `friesian:data:${name}`;
}

export class LocalCollection<T extends { id: string }> {
  private cache: T[] | null = null;

  constructor(
    private readonly name: string,
    private readonly seed: T[],
  ) {}

  private read(): T[] {
    if (this.cache) return this.cache;
    try {
      const raw = localStorage.getItem(storageKey(this.name));
      this.cache = raw ? (JSON.parse(raw) as T[]) : [...this.seed];
      if (!raw) this.write(this.cache);
    } catch {
      this.cache = [...this.seed];
    }
    return this.cache;
  }

  private write(items: T[]): void {
    this.cache = items;
    try {
      localStorage.setItem(storageKey(this.name), JSON.stringify(items));
    } catch {
      // Storage full or unavailable — keep the in-memory copy.
    }
  }

  async list(predicate?: (item: T) => boolean): Promise<T[]> {
    const items = this.read();
    return predicate ? items.filter(predicate) : [...items];
  }

  async get(id: string): Promise<T | undefined> {
    return this.read().find((item) => item.id === id);
  }

  async insert(item: T): Promise<T> {
    this.write([item, ...this.read()]);
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    let updated: T | undefined;
    this.write(
      this.read().map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...patch };
        return updated;
      }),
    );
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.write(this.read().filter((item) => item.id !== id));
  }
}
