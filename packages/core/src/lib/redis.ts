import { isDryRunEnv } from './isDryRunEnv';
import { createClient, type RedisClientType } from 'redis';
import { env } from './envConfig';

function createDummyRedisClient(): RedisClientType {
  const mock = {
    connect: async () => {},
    disconnect: async () => {},
    get: async () => null,
    set: async () => {},
    on: () => {},
    isOpen: true,
  };

  return mock as unknown as RedisClientType; // ✅ required double-cast
}

let redis: RedisClientType;

if (isDryRunEnv) {
  console.log('[DryRunMode] Skipping Redis client initialization');
  redis = createDummyRedisClient();
} else {
  redis = createClient({ url: env.REDIS_URL });

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
