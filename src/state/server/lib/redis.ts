// src/state/server/lib/redis.ts

import type { RedisClientType } from 'redis';
import { getServerFrameworkConfig } from '@shared/utils/server';

export let redis: RedisClientType | undefined;

export async function getRedisClient(): Promise<RedisClientType | undefined> {
  const { REDIS_URL } = getServerFrameworkConfig();

  if (!REDIS_URL) {
    console.log('[StateForge] REDIS_URL not set — Redis will not be used');
    return undefined;
  }

  if (redis) return redis;

  try {
    const { createClient } = await import('redis');
    redis = createClient({ url: REDIS_URL });

    redis.on('error', (err: unknown) => {
      console.error('[StateForge][Redis] Connection error:', err);
    });

    await redis.connect();
    return redis;
  } catch (error) {
    console.error('[StateForge][Redis] Failed to initialize Redis:', error);
    return undefined;
  }
}
