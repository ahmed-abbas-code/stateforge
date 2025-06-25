export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  providerId: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error?: Error | null;

  // ✅ Added field for framework-level auth logic
  isAuthenticated: boolean;

  // ✅ Standardized auth actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}
