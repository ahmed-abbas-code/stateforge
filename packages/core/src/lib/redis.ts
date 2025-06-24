import { createClient, RedisClientType } from 'redis';
import { env } from '@/lib/envConfig';

export const redis: RedisClientType = createClient({
  url: env.REDIS_URL,
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err);
});

if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.error('[Redis] Failed to connect:', err);
  });
}
