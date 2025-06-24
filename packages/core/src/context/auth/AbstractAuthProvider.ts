export interface AbstractAuthProvider {
  getUser(): any;
  isLoading(): boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
  getToken?(): Promise<string | null>;
}
