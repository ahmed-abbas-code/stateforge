// src/authentication/shared/types/Auth.ts

import type { NextApiRequest } from 'next';
import type { Auth } from 'firebase/auth';
import { AuthUserType } from '@authentication/shared/types';

export interface AuthContextType {
  user: AuthUserType | null;

  // For Firebase support
  setUser?: (user: AuthUserType | null) => void;
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

  // ✅ Added for centralized 401 handling
  handleResponse?: (res: Response) => Promise<Response>;
}

export interface AuthApiRequest extends NextApiRequest {
  user: AuthUserType;
}
