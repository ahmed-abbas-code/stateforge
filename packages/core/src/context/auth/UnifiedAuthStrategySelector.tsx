import { FirebaseAuthProviderImpl } from './FirebaseAuthProviderImpl';
import { Auth0AuthProviderImpl } from './Auth0AuthProviderImpl';
import { config } from '@/lib/config';

export const UnifiedAuthStrategySelector = ({ children }: { children: React.ReactNode }) => {
  const strategy = config.AUTH_STRATEGY;

  if (strategy === 'firebase') {
    return <FirebaseAuthProviderImpl>{children}</FirebaseAuthProviderImpl>;
  }

  if (strategy === 'auth0') {
    return <Auth0AuthProviderImpl>{children}</Auth0AuthProviderImpl>;
  }

  throw new Error(`Unsupported auth strategy: ${strategy}`);
};
