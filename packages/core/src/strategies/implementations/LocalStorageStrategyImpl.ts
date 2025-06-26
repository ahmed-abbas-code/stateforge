import { PersistenceStrategyBase } from '../../types/PersistenceOptions';

export class LocalStorageStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly namespace: string;
  private readonly defaultKey: string;

  constructor(namespace: string = 'default', defaultKey: string = 'value') {
    this.namespace = namespace;
    this.defaultKey = defaultKey;
  }

  private withNamespace(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    if (typeof window === 'undefined') {
      console.warn(`[LocalStorageStrategy] Attempted to read key "${key}" in a non-browser environment.`);
      return undefined;
    }

    try {
      const raw = localStorage.getItem(this.withNamespace(key));
      if (raw === null) return undefined;

      const parsed = JSON.parse(raw);
      return parsed as T;
    } catch (err) {
      console.error(`[LocalStorageStrategy] Failed to parse value for key "${key}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') {
      console.warn(`[LocalStorageStrategy] Attempted to write key "${key}" in a non-browser environment.`);
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.withNamespace(key), serialized);
    } catch (err) {
      console.error(`[LocalStorageStrategy] Failed to serialize value for key "${key}":`, err);
    }
  }

  // === Overloaded Save ===
  async save(value: T): Promise<void>;
  async save(key: string, value: T): Promise<void>;
  async save(arg1: string | T, arg2?: T): Promise<void> {
    if (typeof arg1 === 'string' && typeof arg2 !== 'undefined') {
      return this.set(arg1, arg2);
    } else {
      return this.set(this.defaultKey, arg1 as T);
    }
  }

  // === Overloaded Load ===
  async load(): Promise<T | undefined>;
  async load(key: string): Promise<T | undefined>;
  async load(key?: string): Promise<T | undefined> {
    return this.get(key ?? this.defaultKey);
  }
}
