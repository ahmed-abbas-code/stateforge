// packages/core/src/client/context/auth/UnifiedAuthStrategySelector.tsx
import React, { ReactNode } from 'react';

import { FirebaseAuthContextProvider } from './FirebaseAuthContextProvider';
import { Auth0AuthContextProvider } from './Auth0AuthContextProvider';
import { DummyAuthContextProvider } from './DummyAuthContextProvider';

export interface UnifiedAuthStrategySelectorProps {
  children: ReactNode;
}

const strategy = process.env.NEXT_PUBLIC_AUTH_STRATEGY;

export const UnifiedAuthStrategySelector: React.FC<UnifiedAuthStrategySelectorProps> = ({ children }) => {
  switch (strategy) {
    case 'firebase':
      return <FirebaseAuthContextProvider>{children}</FirebaseAuthContextProvider>;

    case 'auth0':
      return <Auth0AuthContextProvider>{children}</Auth0AuthContextProvider>;

    case 'dryrun':
      return <DummyAuthContextProvider>{children}</DummyAuthContextProvider>;

    default:
      throw new Error(
        `Unsupported auth strategy "${strategy}". Set NEXT_PUBLIC_AUTH_STRATEGY in your .env file to "firebase", "auth0", or "dryrun".`
      );
  }
};
