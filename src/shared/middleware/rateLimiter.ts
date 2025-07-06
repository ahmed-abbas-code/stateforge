// src/shared/middleware/rateLimiter.ts

import rateLimit from 'next-rate-limit';

export const rateLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});
