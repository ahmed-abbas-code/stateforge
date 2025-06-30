import type { NextApiHandler } from 'next';
import { verifyFirebaseToken } from '../lib/verifyFirebaseToken';
import type { AuthApiRequest, AuthUser } from '../types/Auth';

export function withAuthValidation(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
      const decoded = await verifyFirebaseToken(token); // Firebase DecodedIdToken

      const user: AuthUser = {
        uid: decoded.uid,
        email: decoded.email ?? null,           // 🔄 Normalize to null
        displayName: decoded.name ?? null,      // 🔄 Optional mapping
        providerId: 'firebase',                 // optional fallback
      };

      (req as AuthApiRequest).user = user;

      return handler(req, res);
    } catch (err) {
      console.error('Auth token verification failed', err);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

  };
}
