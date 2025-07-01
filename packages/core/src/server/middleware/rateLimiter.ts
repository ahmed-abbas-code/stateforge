import rateLimit from 'next-rate-limit';

export const rateLimiter: ReturnType<typeof rateLimit> = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});
