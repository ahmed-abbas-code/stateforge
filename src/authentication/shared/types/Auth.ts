// src/authentication/shared/types/Auth.ts

import type { NextApiRequest } from 'next';
import { Auth } from 'firebase-admin/auth';
import { AuthUser } from '@authentication/auth/shared';

export interface AuthContextType {
  user: AuthUser | null;

  // For Firebase support
  setUser?: (user: AuthUser | null) => void;
  auth?: Auth;
  signIn?: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;

  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;

  isLoading: boolean;
  error?: Error | null;
  isAuthenticated: boolean;

  // For Auth0 redirect flows
  handleRedirectCallback?: () => Promise<void>;

  // For proactive refresh (client SDKs only)
  refreshToken?: () => Promise<string | null>;
}

export interface AuthApiRequest extends NextApiRequest {
  user: AuthUser;
}
