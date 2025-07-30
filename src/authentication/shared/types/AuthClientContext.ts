// src/authentication/shared/types/AuthClientContext.ts

import type { NextApiRequest } from 'next';
import type { Auth } from 'firebase/auth';
import { Session } from '@authentication/shared/types/AuthProvider';

/**
 * RefreshTokenFn:
 * - If providerId provided → refresh session for that provider (generic).
 * - If idToken provided with opts.isIdToken → refresh session via ID token (Firebase).
 */
export type RefreshTokenFn = (
  providerIdOrIdToken?: string,
  opts?: { isIdToken?: boolean }
) => Promise<string | null>;

/**
 * Rich meta context returned from /api/auth/context.
 */
export interface AuthContextMeta {
  sessions?: Record<string, Session>;
  users?: Record<string, Session>;
  user?: Session | null;
  ok?: boolean;
  error?: string | null;
  expiresAt?: number;
}

/**
 * Client-side context for authentication state, tokens, and session actions.
 */
export interface AuthClientContext {
  /**
   * Map of provider IDs to authenticated sessions.
   */
  sessions: Record<string, Session>;

  /**
   * Full context payload from the server (/api/auth/context/meta).
   * Exposed for debugging and richer client logic.
   */
  meta?: AuthContextMeta | null;

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
  signIn?: (
    idToken?: string,
    instanceId?: string
  ) => Promise<{ ok: boolean; error?: string }>;

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
   * True if all required sessions are present.
   * - If `instanceIds` is provided, all listed IDs must have a valid session.
   * - Otherwise, true if at least one valid session exists.
   */
  isAuthenticated: boolean;

  /**
   * The list of provider instance IDs this context cares about.
   * - If omitted, context uses all available sessions.
   */
  instanceIds?: string[];

  /**
   * Optional handler for redirect-based auth flows (e.g., Auth0).
   */
  handleRedirectCallback?: () => Promise<void>;

  /**
   * Manually trigger refresh of all or specific provider sessions.
   * - Generic: pass providerId
   * - Firebase: pass idToken with `{ isIdToken: true }`
   *
   * ✅ Always defined in SF's AuthProvider (no more optional).
   */
  refreshToken: RefreshTokenFn;

  /**
   * Wraps fetch responses to handle 401s, token refresh, etc.
   */
  handleResponse?: (res: Response) => Promise<Response>;
}

/**
 * Extended API request that includes authenticated user context (SSR/server-side use).
 */
export interface AuthApiRequest extends NextApiRequest {
  user: unknown; // Can later replace with Session or a typed AuthUser model
}
