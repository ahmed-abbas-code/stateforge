import { AuthUser } from '@authentication/shared';
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  signInWithFirebase,
  signOutFromFirebase,
  verifyFirebaseToken,
  signInWithAuth0,
  signOutFromAuth0,
  verifyAuth0Token,
  signInWithJwt,
  signOutFromJwt,
  verifyJwtToken,
} from '@authentication/server';

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
      return {
        signIn: signInWithFirebase,
        signOut: signOutFromFirebase,
        verifyToken: verifyFirebaseToken,
      };
    case 'auth0':
      return {
        signIn: signInWithAuth0,
        signOut: signOutFromAuth0,
        verifyToken: verifyAuth0Token,
      };
    case 'jwt':
      return {
        signIn: signInWithJwt,
        signOut: signOutFromJwt,
        verifyToken: verifyJwtToken,
      };
    default:
      throw new Error(`Unsupported AUTH_STRATEGY: ${STRATEGY}`);
  }
}

const provider = getProvider();

export const AuthStrategy = {
  verifyToken(req: NextApiRequest): Promise<AuthUser> {
    return provider.verifyToken(req);
  },
  signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return provider.signIn(req, res);
  },
  signOut(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return provider.signOut(req, res);
  },
};
