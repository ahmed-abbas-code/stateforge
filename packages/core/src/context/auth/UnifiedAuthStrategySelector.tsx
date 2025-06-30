// packages/core/src/context/auth/UnifiedAuthStrategySelector.tsx

import React, { ReactNode } from 'react';
import { config } from '../../lib/config';

import { FirebaseAuthContextProvider } from './FirebaseAuthContextProvider';
import { Auth0AuthContextProvider } from './Auth0AuthContextProvider';
import { DummyAuthContextProvider } from './DummyAuthContextProvider';

interface UnifiedAuthStrategySelectorProps {
  children: ReactNode;
}

export const UnifiedAuthStrategySelector: React.FC<UnifiedAuthStrategySelectorProps> = ({ children }) => {
  const strategy = config.AUTH_STRATEGY;

  switch (strategy) {
    case 'firebase':
      return <FirebaseAuthContextProvider>{children}</FirebaseAuthContextProvider>;

    case 'auth0':
      return <Auth0AuthContextProvider>{children}</Auth0AuthContextProvider>;

    case 'dryrun':
      return <DummyAuthContextProvider>{children}</DummyAuthContextProvider>;

    default:
      throw new Error(
        `Unsupported auth strategy "${strategy}". Set AUTH_STRATEGY in your .env file to "firebase", "auth0", or "dryrun".`
      );
  }
};
