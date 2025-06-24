import { AuthContext } from './AuthContext';
import { useUser } from '@auth0/nextjs-auth0/client';

export const Auth0AuthProviderImpl = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();

  const login = async () => {
    window.location.href = '/api/auth/login';
  };

  const logout = async () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
