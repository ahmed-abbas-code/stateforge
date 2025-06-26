// packages/core/src/context/auth/UnifiedAuthStrategySelector.tsx
import React, { ReactNode } from 'react';
import { FirebaseAuthProviderImpl } from './FirebaseAuthProviderImpl';
import { Auth0AuthProviderImpl } from './Auth0AuthProviderImpl';
import { config } from '../../lib/config';

interface UnifiedAuthStrategySelectorProps {
  children: ReactNode;
}

export const UnifiedAuthStrategySelector = ({ children }: UnifiedAuthStrategySelectorProps) => {
  const strategy = config.AUTH_STRATEGY;

  if (strategy === 'firebase') {
    return <FirebaseAuthProviderImpl>{children}</FirebaseAuthProviderImpl>;
  }

  if (strategy === 'auth0') {
    return <Auth0AuthProviderImpl>{children}</Auth0AuthProviderImpl>;
  }

  throw new Error(
    `Unsupported auth strategy "${strategy}". Set AUTH_STRATEGY in your .env.local file to "firebase" or "auth0".`
  );
};
