export interface Registration {
  id: string;
  version: number;
}
export class Registry<T extends Registration> {
  private entries = new Map<string, T>();
  constructor(entries: T[] = []) {
    entries.forEach((entry) => this.register(entry));
  }
  register(entry: T): void {
    if (this.entries.has(entry.id))
      throw new Error(`Duplicate registration: ${entry.id}`);
    this.entries.set(entry.id, entry);
  }
  get(id: string): T | undefined {
    return this.entries.get(id);
  }
  all(): T[] {
    return [...this.entries.values()];
  }
}
