// packages/authentication/server/auth-strategy.ts

import { AuthUser } from '@authentication/auth/shared';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as FirebaseProvider from '@authentication/auth/server/providers/firebase';
import * as Auth0Provider from '@authentication/auth/server/providers/auth0';
import * as JWTProvider from '@authentication/auth/server/providers/jwt';

const STRATEGY = process.env.AUTH_STRATEGY;

if (!STRATEGY) {
  throw new Error('Missing AUTH_STRATEGY environment variable.');
}

type Provider = {
  verifyToken: (req: NextApiRequest) => Promise<AuthUser>;
  signIn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  signOut: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

function getProvider(): Provider {
  switch (STRATEGY) {
    case 'firebase':
      return FirebaseProvider;
    case 'auth0':
      return Auth0Provider;
    case 'jwt':
      return JWTProvider;
    default:
      throw new Error(`Unsupported AUTH_STRATEGY: ${STRATEGY}`);
  }
}

const provider = getProvider();

export const AuthStrategy = {
  /**
   * Verifies the current session using the configured strategy.
   * Returns AuthUser or throws if invalid/expired.
   */
  verifyToken(req: NextApiRequest): Promise<AuthUser> {
    return provider.verifyToken(req);
  },

  /**
   * Handles sign-in for the active strategy.
   * Firebase/JWT: expects idToken/token in body.
   * Auth0: performs redirect.
   */
  signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return provider.signIn(req, res);
  },

  /**
   * Handles sign-out and session termination for the active strategy.
   */
  signOut(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return provider.signOut(req, res);
  },
};
