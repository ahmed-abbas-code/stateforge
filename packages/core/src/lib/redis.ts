import { isDryRunEnv } from './isDryRunEnv';
import type { RedisClientType } from 'redis';

let redis: RedisClientType;

if (isDryRunEnv) {
  console.log('[DryRunMode] Skipping Redis client initialization');

  // ✅ Create a dummy stub with no-op methods
  redis = {
    connect: async () => {},
    disconnect: async () => {},
    get: async () => null,
    set: async () => {},
    on: () => {},
    isOpen: true,
  } as unknown as RedisClientType;
} else {
  const { createClient } = require('redis');
  const { env } = require('./envConfig');

  redis = createClient({
    url: env.REDIS_URL,
  });

  redis.on('error', (err: unknown) => {
    console.error('[Redis] Connection error:', err);
  });

  if (!redis.isOpen) {
    redis.connect().catch((err: unknown) => {
      console.error('[Redis] Failed to connect:', err);
    });
  }
}

export { redis };
