// packages/core/src/server/lib/redis.ts

import { createClient, type RedisClientType } from 'redis';
import { config } from '@core/common/utils/configStore';

function createDummyRedisClient(): RedisClientType {
  const mock = {
    connect: async () => {},
    disconnect: async () => {},
    get: async () => null,
    set: async () => {},
    on: () => {},
    isOpen: true,
  };

  return mock as unknown as RedisClientType;
}

let redis: RedisClientType;

if (config.isDryRun) {
  console.log('[DryRunMode] Skipping Redis client initialization');
  redis = createDummyRedisClient();
} else {
  redis = createClient({ url: config.REDIS_URL });

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
