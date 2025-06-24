import type { NextApiHandler } from 'next';

export function withSSOGuard(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const ssoSession = req.cookies['sso_session'];
    if (!ssoSession) return res.status(401).json({ error: 'SSO session required' });

    // Optionally validate SSO session against Firebase/Auth0
    return handler(req, res);
  };
}
