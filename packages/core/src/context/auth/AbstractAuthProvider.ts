import type { AuthUser } from '../../types/Auth'; // adjust path as needed

export interface AbstractAuthProvider {
  getUser(): AuthUser | null;
  isLoading(): boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
  getToken?(): Promise<string | null>;
}
