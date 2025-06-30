import { PersistenceStrategyBase } from '../../types/PersistenceOptions';

type MemoryStore = Record<string, string>;
const memoryStore: MemoryStore = {};

export class NavigationStateStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly isBrowser = typeof window !== 'undefined';
  private readonly namespace: string;
  private readonly storageKeyPrefix = '__nav_state__';

  constructor(namespace: string = 'default') {
    this.namespace = namespace;
  }

  private withNamespace(key: string): string {
    return `${this.storageKeyPrefix}:${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    const fullKey = this.withNamespace(key);

    try {
      const raw = this.isBrowser
        ? sessionStorage.getItem(fullKey)
        : memoryStore[fullKey];

      if (!raw) return undefined;

      const parsed = JSON.parse(raw);
      return parsed as T;
    } catch (err) {
      console.error(`[NavigationStateStrategy] Failed to read key "${key}" (fullKey="${fullKey}")`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    const fullKey = this.withNamespace(key);

    try {
      const raw = JSON.stringify(value);

      if (this.isBrowser) {
        sessionStorage.setItem(fullKey, raw);
      } else {
        memoryStore[fullKey] = raw;
      }
    } catch (err) {
      console.error(`[NavigationStateStrategy] Failed to write key "${key}" (fullKey="${fullKey}")`, err);
    }
  }

  async load(key: string, _ctx?: unknown): Promise<T | undefined> {
    void _ctx; // ✅ suppress unused param warning
    return this.get(key);
  }
}
