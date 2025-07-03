// packages/core/src/server/lib/redis.ts

import { createClient, type RedisClientType } from 'redis';
import { getServerFrameworkConfig } from '@core/common/utils/getServerFrameworkConfig';

function createDummyRedisClient(): RedisClientType {
  const mock = {
    connect: async () => {},
    disconnect: async () => {},
    get: async () => null,
    set: async () => {},
    on: () => {},
    isOpen: false,
  };
  return mock as unknown as RedisClientType;
}

const { isDryRun, REDIS_URL } = getServerFrameworkConfig();

let redis: RedisClientType;

if (isDryRun) {
  console.log('[DryRunMode] Skipping Redis client initialization');
  redis = createDummyRedisClient();
} else if (!REDIS_URL) {
  console.warn('[Redis] REDIS_URL not set — using dummy Redis client.');
  redis = createDummyRedisClient();
} else {
  try {
    redis = createClient({ url: REDIS_URL });

    redis.on('error', (err: unknown) => {
      console.error('[Redis] Connection error:', err);
    });

    redis.connect().catch((err: unknown) => {
      console.error('[Redis] Failed to connect:', err);
    });
  } catch (e) {
    console.error('[Redis] Unexpected failure during client setup. Using dummy client.', e);
    redis = createDummyRedisClient();
  }
}

export { redis };
