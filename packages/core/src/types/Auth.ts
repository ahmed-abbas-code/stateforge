import type { NextApiRequest } from 'next';
import type { Auth } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  providerId?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: AuthUser | null;

  // Optional: for Firebase support
  setUser?: (user: AuthUser | null) => void;
  auth?: Auth;
  signIn?: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;

  isLoading: boolean;
  error?: Error | null;
  isAuthenticated: boolean;

  // Optional: for redirect flows (e.g., Auth0)
  handleRedirectCallback?: () => Promise<void>;

  // Optional: for proactive refresh
  refreshToken?: () => Promise<string | null>;
}

/**
 * Extends Next.js API request to include authenticated user info.
 * Used in server-side API middleware (e.g., withAuthValidation).
 */
export interface AuthApiRequest extends NextApiRequest {
  user: AuthUser;
}
