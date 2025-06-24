import rateLimit from 'next-rate-limit';

/**
 * Rate limiter instance for use in API handlers.
 * Use `rateLimiter.check()` or `rateLimiter.checkNext()` in route handlers.
 */
// Prevent non-portable type export by casting to `any`
export const rateLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
}) as any;
