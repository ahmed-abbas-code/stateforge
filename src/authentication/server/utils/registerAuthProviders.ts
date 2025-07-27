// src/authentication/server/utils/registerAuthProviders.ts

import { registerAuthProviderInstances } from '@authentication/server/utils/authRegistry';
import type { AuthProviderInstance } from '@authentication/shared/types/AuthProvider';

// Import factory functions
import { createAuthProvider as createFirebaseProvider } from '@authentication/server/providers/firebase';
import { createAuthProvider as createJwtProvider } from '@authentication/server/providers/jwt';

/**
 * Registers all auth provider instances for the app.
 * Call this once during app/server startup.
 */
export function registerAuthProviders() {
  const instances: Record<string, AuthProviderInstance> = {
    default: createFirebaseProvider('default'),
    jwt: createJwtProvider('default'),
    // Add more instances here as needed
  };

  registerAuthProviderInstances(instances);
}
