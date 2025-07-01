import type { NextApiRequest, NextApiResponse } from 'next';

const blockedIPs = ['1.2.3.4', '5.6.7.8'];

export function ipGuard(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (blockedIPs.includes(ip as string)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }
  next();
}
