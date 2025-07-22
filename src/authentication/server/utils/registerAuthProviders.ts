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
        firebase: createFirebaseProvider('firebase'),
        dunnixer: createJwtProvider('dunnixer'),
        // Add more instances here as needed
    };

    registerAuthProviderInstances(instances);
}
