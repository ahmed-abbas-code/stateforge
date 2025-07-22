// src/authentication/server/utils/authRegistry.ts

import type { AuthProviderInstance } from '@authentication/shared';

/**
 * Utility type to strongly type the full provider registry.
 * Enforces that each key maps to a valid AuthProviderInstance.
 */
export type AuthProviderRegistry<T extends Record<string, AuthProviderInstance>> = T;

/**
 * Internal storage for registered auth provider instances.
 * Keys are instance IDs (e.g. 'firebase', 'dunnixer', 'billing')
 */
let _authProviderInstances: Record<string, AuthProviderInstance> = {};

/**
 * Registers the full set of auth provider instances.
 * Must be called during app initialization (e.g., in initAuth.ts).
 * Enforces strong typing using the AuthProviderRegistry type.
 */
export function registerAuthProviderInstances<
  T extends Record<string, AuthProviderInstance>
>(instances: AuthProviderRegistry<T>): void {
  _authProviderInstances = instances;
}

/**
 * Retrieves all registered auth provider instances.
 */
export function getAuthProviderInstances(): Record<string, AuthProviderInstance> {
  return _authProviderInstances;
}
