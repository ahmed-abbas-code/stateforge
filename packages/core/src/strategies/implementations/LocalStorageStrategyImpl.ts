import { PersistenceStrategyBase } from '@/types/PersistenceOptions';

export class LocalStorageStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private namespace: string;

  constructor(namespace: string = 'default') {
    this.namespace = namespace;
  }

  private withNamespace(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    if (typeof window === 'undefined') {
      console.warn(`[LocalStorage] Attempted to access key "${key}" in a non-browser environment.`);
      return undefined;
    }

    try {
      const raw = localStorage.getItem(this.withNamespace(key));
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[LocalStorage] Failed to parse value for key "${key}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn(`[LocalStorage] Attempted to set key "${key}" in a non-browser environment.`);
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.withNamespace(key), serialized);
    } catch (err) {
      console.error(`[LocalStorage] Failed to serialize value for key "${key}":`, err);
    }
  }
}
