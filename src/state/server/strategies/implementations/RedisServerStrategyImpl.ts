// src/state/server/strategies/implementations/RedisServerStrategyImpl.ts

import { getRedisClient } from "@state/server";
import { PersistenceStrategyBase } from "@state/shared";

export class RedisServerStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly namespace: string;
  private readonly ttlSeconds?: number;

  constructor(namespace: string = 'default', ttlSeconds?: number) {
    this.namespace = namespace;
    this.ttlSeconds = ttlSeconds;
  }

  private withNamespace(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn('[RedisServerStrategy] Redis unavailable — skipping get.');
      return undefined;
    }

    const namespacedKey = this.withNamespace(key);

    try {
      const raw = await redis.get(namespacedKey);
      if (!raw) return undefined;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[RedisServerStrategy] Failed to get key "${key}" (namespaced: "${namespacedKey}")`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    const redis = await getRedisClient();
    if (!redis) {
      console.warn('[RedisServerStrategy] Redis unavailable — skipping set.');
      return;
    }

    const namespacedKey = this.withNamespace(key);

    try {
      const serialized = JSON.stringify(value);
      if (this.ttlSeconds !== undefined) {
        await redis.setEx(namespacedKey, this.ttlSeconds, serialized);
      } else {
        await redis.set(namespacedKey, serialized);
      }
    } catch (err) {
      console.error(`[RedisServerStrategy] Failed to set key "${key}" (namespaced: "${namespacedKey}")`, err);
    }
  }
}
