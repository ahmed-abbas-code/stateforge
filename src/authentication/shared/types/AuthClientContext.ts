// src/authentication/shared/types/AuthClientContext.ts

import type { NextApiRequest } from 'next';
import type { Auth } from 'firebase/auth';
import { Session } from '@authentication/shared/types/AuthProvider';

/**
 * Client-side context for authentication state, tokens, and session actions.
 */
export interface AuthClientContext {
  /**
   * Map of provider IDs to authenticated sessions.
   */
  sessions: Record<string, Session>;

  /**
   * Set the full session map manually (e.g., during hydration).
   */
  setSessions: (sessions: Record<string, Session>) => void;

  /**
   * Firebase client SDK instance (optional; used if Firebase is a provider).
   */
  auth?: Auth;

  /**
   * Optional sign-in method (interactive or silent).
   */
  signIn?: (providerId?: string) => Promise<{ ok: boolean; error?: string }>;

  /**
   * Signs out of one or more provider instances.
   * If no `providerIds` provided, signs out of all.
   */
  signOut: (providerIds?: string[]) => Promise<void>;

  /**
   * Get an access token (or JWT) for a specific provider.
   * If `providerId` is omitted, returns token for the default provider (if any).
   */
  getToken: (providerId?: string) => Promise<string | null>;

  /**
   * True while authentication context is initializing or fetching.
   */
  isLoading: boolean;

  /**
   * Captures any authentication-related errors.
   */
  error?: Error | null;

  /**
   * True if any valid session is present.
   */
  isAuthenticated: boolean;

  /**
   * Optional handler for redirect-based auth flows (e.g., Auth0).
   */
  handleRedirectCallback?: () => Promise<void>;

  /**
   * Manually trigger refresh of all or specific provider sessions.
   */
  refreshToken?: (providerId?: string) => Promise<string | null>;

  /**
   * Wraps fetch responses to handle 401s, token refresh, etc.
   */
  handleResponse?: (res: Response) => Promise<Response>;
}

/**
 * Extended API request that includes authenticated user context (SSR/server-side use).
 */
export interface AuthApiRequest extends NextApiRequest {
  user: unknown; // Consider replacing with `Session` or `AuthUserType` depending on your SSR model
}
