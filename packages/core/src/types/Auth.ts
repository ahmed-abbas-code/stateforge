import type { NextApiRequest } from 'next';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  providerId?: string; 
  [key: string]: unknown;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error?: Error | null;

  // ✅ Framework-level logic
  isAuthenticated: boolean;

  // ✅ Standardized auth actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

/**
 * Extends Next.js API request to include authenticated user info.
 * Used in server-side API middleware (e.g., withAuthValidation).
 */
export interface AuthApiRequest extends NextApiRequest {
  user: AuthUser;
}
