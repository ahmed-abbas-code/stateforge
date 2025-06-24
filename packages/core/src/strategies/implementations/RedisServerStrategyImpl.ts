import { redis } from '@/lib/redis';
import { PersistenceStrategyBase } from '@/types/PersistenceOptions';

export class RedisServerStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly ttlSeconds?: number;
  private readonly namespace: string;

  constructor(namespace: string = 'default', ttlSeconds?: number) {
    this.namespace = namespace;
    this.ttlSeconds = ttlSeconds;
  }

  private withNamespace(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    const namespacedKey = this.withNamespace(key);

    try {
      const raw = await redis.get(namespacedKey);
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[Redis] Failed to get key "${key}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    const namespacedKey = this.withNamespace(key);

    try {
      const serialized = JSON.stringify(value);
      if (this.ttlSeconds !== undefined) {
        await redis.setEx(namespacedKey, this.ttlSeconds, serialized);
      } else {
        await redis.set(namespacedKey, serialized);
      }
    } catch (err) {
      console.error(`[Redis] Failed to set key "${key}":`, err);
    }
  }
}
