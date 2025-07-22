// src/authentication/shared/types/AuthProvider.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import type { SerializeOptions } from 'cookie';
import type { AuthProviderType } from './validation/authSchema';

/**
 * Session object returned by any provider.
 * Can be enriched with custom fields (e.g., roles, tokens, expiry).
 */
export interface Session {
  /**
   * Globally unique user identifier
   */
  userId: string;

  /**
   * Optional user email
   */
  email?: string;

  /**
   * Optional access token associated with the session (e.g., JWT, Firebase ID token)
   */
  token?: string;

  /**
   * Optional refresh token (used server-side only)
   */
  refreshToken?: string;

  /**
   * Optional expiration timestamp (in seconds since epoch)
   */
  expiresAt?: number;

  /**
   * Arbitrary provider-specific session claims or metadata
   */
  [key: string]: any;
}

/**
 * Convenience alias for mapping instance IDs to their sessions.
 */
export type SessionMap = Record<string, Session>;

/**
 * Context object passed to chaining hooks and refresh handlers.
 */
export interface AuthContext {
  req: NextApiRequest;
  res: NextApiResponse;
  existingSessions: SessionMap;
}

/**
 * Factory function type for creating a provider instance dynamically.
 */
export type AuthProviderFactory = (instanceId: string) => AuthProviderInstance;

/**
 * AuthProviderInstance represents a single registered auth integration.
 * Identified by a unique `id`, and tagged by its `type`.
 */
export interface AuthProviderInstance {
  /**
   * Unique ID for this provider instance (e.g., 'firebase', 'dunnixer', 'billing')
   */
  id: string;

  /**
   * Type/class of this provider (e.g., 'jwt', 'firebase')
   */
  type: AuthProviderType;

  /**
   * Sign in a user and set session cookie(s)
   */
  signIn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

  /**
   * Verify token from cookie or request context.
   * May perform silent refresh internally if needed.
   */
  verifyToken: (req: NextApiRequest, res: NextApiResponse) => Promise<Session | null>;

  /**
   * Sign out the user and clear session cookie(s)
   */
  signOut: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

  /**
   * Optional hook to enrich or forward session after verification
   */
  onVerifySuccess?: (session: Session, context: AuthContext) => Promise<Session>;

  /**
   * Cookie options used when setting/removing session cookies.
   * Can be a static object or a function that returns options based on context.
   */
  cookieOptions?: SerializeOptions | ((context: AuthContext) => SerializeOptions);

  /**
   * Optional method to refresh an expired or stale session.
   * Called by the framework (e.g., /api/auth/refresh), or manually from the client.
   * Should update the session cookie and return a fresh session object.
   */
  refreshToken?: (context: AuthContext) => Promise<Session | null>;
}
