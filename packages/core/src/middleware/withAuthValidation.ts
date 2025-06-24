import type { NextApiHandler } from 'next';
import { verifyFirebaseToken } from '@/lib/verifyFirebaseToken';

export function withAuthValidation(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      const user = await verifyFirebaseToken(token); // or Auth0 equivalent
      (req as any).user = user;
      return handler(req, res);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };
}
