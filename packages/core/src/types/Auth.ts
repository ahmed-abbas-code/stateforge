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
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}
