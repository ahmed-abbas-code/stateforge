// src/authentication/providers/AuthenticationChain.ts

import {
  AuthProviderInstance,
  AuthContext,
  Session
} from '@authentication/shared/types/AuthProvider';
import { NextApiRequest, NextApiResponse } from 'next';

export interface ChainedProviderOptions {
  /**
   * Modify or filter the list of providers before chaining
   */
  onStart?: (providers: AuthProviderInstance[]) => AuthProviderInstance[];

  /**
   * Called after each provider verifies a token
   */
  onEachVerify?: (
    provider: AuthProviderInstance,
    session: Session | null,
    context: AuthContext
  ) => Promise<Session | null>;

  /**
   * Final transformation step to build a combined session
   */
  onFinish?: (results: Record<string, Session>) => Promise<Session | null>;

  /**
   * If true, return the full session map instead of just one session
   */
  returnAll?: boolean;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Creates a composite (chained) auth provider that sequentially delegates to other providers.
 */
export function createChainedProvider(
  id: string,
  providers: AuthProviderInstance[],
  options?: ChainedProviderOptions
): AuthProviderInstance {
  return {
    id,
    type: 'composite', // ✅ valid AuthProviderType

    async signIn(req: NextApiRequest, res: NextApiResponse) {
      for (const p of providers) {
        await p.signIn(req, res);
      }
    },

    async verifyToken(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
      const sessions: Record<string, Session> = {};
      const context: AuthContext = {
        req,
        res,
        existingSessions: sessions,
      };

      const chain = options?.onStart ? options.onStart(providers) : providers;

      for (const provider of chain) {
        let session = await provider.verifyToken(req, res);
        if (options?.onEachVerify) {
          session = await options.onEachVerify(provider, session, context);
        }
        if (session) {
          sessions[provider.id] = session;
        }
      }

      // ✅ If explicitly asked, return the whole sessions map
      if (options?.returnAll) {
        // @ts-expect-error allow override: caller knows they asked for all sessions
        return sessions;
      }

      if (options?.onFinish) {
        return await options.onFinish(sessions);
      }

      // ✅ Default: pick the session with the latest expiry
      const sorted = Object.values(sessions).sort(
        (a, b) => (b.expiresAt ?? 0) - (a.expiresAt ?? 0)
      );

      return sorted[0] ?? null;
    },

    async signOut(req: NextApiRequest, res: NextApiResponse) {
      for (const p of providers) {
        await p.signOut(req, res);
      }
    },

    // ⚠️ Composite providers don’t manage cookies directly, but must return safe defaults
    cookieOptions: {
      maxAge: 0,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    }
  };
}
