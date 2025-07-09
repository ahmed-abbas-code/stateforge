import type { NextApiRequest, NextApiResponse } from 'next';
import {
  signInWithAuth0,
  signInWithFirebase,
  signInWithJwt,
  signOutFromAuth0,
  signOutFromFirebase,
  signOutFromJwt,
  verifyAuth0Token,
  verifyFirebaseToken,
  verifyJwtToken,
} from '@authentication/server';

import type { AuthUserType } from '@authentication/shared';
import * as jwt from './providers/jwt';


const STRATEGY = process.env.AUTH_STRATEGY;
if (!STRATEGY) {
  throw new Error('Missing AUTH_STRATEGY environment variable.');
}

type Provider = {
  verifyToken: (req: NextApiRequest) => Promise<AuthUserType>;
  signIn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
  signOut: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
};

function getProvider(): Provider {
  switch (STRATEGY) {
    case 'firebase':
      return {
        verifyToken: verifyFirebaseToken,
        signIn: signInWithFirebase,
        signOut: signOutFromFirebase,
      };

    case 'firebase-sso': {
      return {
        verifyToken: verifyFirebaseToken,
        async signIn(req, res) {
          await signInWithFirebase(req, res);
          try {
            const { id_token } = req.body;
            if (id_token) await jwt.signIn(req, res); // set backend cookie
          } catch (err) {
            console.warn('[firebase-sso] post-signIn failed:', err);
          }
        },
        async signOut(req, res) {
          await signOutFromFirebase(req, res);
          try {
            await jwt.signOut(req, res); // clear backend cookie
          } catch (err) {
            console.warn('[firebase-sso] post-signOut failed:', err);
          }
        },
      };
    }

    case 'auth0':
      return {
        verifyToken: verifyAuth0Token,
        signIn: signInWithAuth0,
        signOut: signOutFromAuth0,
      };

    case 'jwt':
      return {
        verifyToken: verifyJwtToken,
        signIn: signInWithJwt,
        signOut: signOutFromJwt,
      };

    default:
      throw new Error(`Unsupported AUTH_STRATEGY: ${STRATEGY}`);
  }
}

const provider = getProvider();

export const AuthStrategyProvider = {
  verifyToken(req: NextApiRequest): Promise<AuthUserType> {
    return provider.verifyToken(req);
  },
  signIn(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return provider.signIn(req, res);
  },
  signOut(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    return provider.signOut(req, res);
  },
};
