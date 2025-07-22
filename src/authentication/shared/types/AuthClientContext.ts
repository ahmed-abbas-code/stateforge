// src/authentication/shared/types/AuthClientContext.ts

import type { NextApiRequest } from 'next';
import type { Auth } from 'firebase/auth';
import type { AuthUserType } from './validation/authSchema';

/**
 * Client-side context for authentication state, tokens, and session actions.
 */
export interface AuthClientContext {
  /**
   * Current user object (composite or provider-specific).
   */
  user: AuthUserType | null;

  /**
   * Set the current user manually (e.g., SSR hydration or auth override).
   */
  setUser?: (user: AuthUserType | null) => void;

  /**
   * Firebase client SDK instance (optional; used if Firebase is a provider).
   */
  auth?: Auth;

  /**
   * Optional sign-in method (e.g. for Firebase or other interactive flows).
   */
  signIn?: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  /**
   * Signs out of one or more provider instances.
   * If `providerIds` is not specified, signs out of all.
   */
  signOut: (providerIds?: string[]) => Promise<void>;

  /**
   * Get an access token (or JWT) for a specific provider.
   * If `providerId` is omitted, returns the default token (if applicable).
   */
  getToken: (providerId?: string) => Promise<string | null>;

  /**
   * True while the auth context is loading (e.g. on mount or during hydration).
   */
  isLoading: boolean;

  /**
   * Captures any authentication error encountered on the client.
   */
  error?: Error | null;

  /**
   * True if a valid session exists for any provider.
   */
  isAuthenticated: boolean;

  /**
   * Optional handler for redirect-based sign-in flows (e.g., Auth0).
   */
  handleRedirectCallback?: () => Promise<void>;

  /**
   * Explicitly refresh the user's session or token(s).
   * Can be triggered by UI or silently by auto-refresh logic.
   */
  refreshToken?: () => Promise<string | null>;

  /**
   * Wraps a fetch response to handle common auth errors (e.g., token expiry).
   */
  handleResponse?: (res: Response) => Promise<Response>;
}

/**
 * Extended API request that includes authenticated user context (SSR/server-side use).
 */
export interface AuthApiRequest extends NextApiRequest {
  user: AuthUserType;
}
