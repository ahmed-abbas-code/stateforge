import React, { ReactNode } from 'react';
import { FirebaseAuthProviderImpl } from './FirebaseAuthProviderImpl';
import { Auth0AuthProviderImpl } from './Auth0AuthProviderImpl';
import { DummyAuthProviderImpl } from './DummyAuthProviderImpl';
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

  if (strategy === 'dryrun') {
    return <DummyAuthProviderImpl>{children}</DummyAuthProviderImpl>;
  }

  throw new Error(
    `Unsupported auth strategy "${strategy}". Set AUTH_STRATEGY in your .env file to "firebase", "auth0", or "dryrun".`
  );
};
