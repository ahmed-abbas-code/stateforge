// ───────────────────────────────────────────────────────────────
// Ensure this file is treated as a runtime module so TS emits JS.
export const __ensureRuntimeEmit = true;

// ─── Public Types ───────────────────────────────────────────────
export type {
  AppSharedState,
  AppStateContextType,
} from './types/AppState';

export type {
  AuthUser,
  AuthContextType,
} from './types/Auth';

export type {
  NavigationState,
  NavigationStateContextType,
} from './types/NavigationState';

export * from './types/PersistenceOptions';
export * from './types/validation/authSchema';

// ─── Public Contexts ────────────────────────────────────────────
import { AppStateContext, AppStateProvider, useAppState } from './context/state/AppStateContext';
export { AppStateContext, AppStateProvider, useAppState };

import { NavigationStateContext, NavigationStateProvider } from './context/state/NavigationStateContext';
export { NavigationStateContext, NavigationStateProvider };

import { AuthContext, useAuth } from './context/auth/AuthContext';
export { AuthContext, useAuth };

import { UnifiedAuthStrategySelector as _AuthProvider } from './context/auth/UnifiedAuthStrategySelector';
export const AuthProvider = _AuthProvider;

// ─── Public Hooks ───────────────────────────────────────────────
export { usePersistedFramework } from './hooks/usePersistedFramework';
export { useNavigationPersistedState } from './hooks/useNavigationPersistedState';

// ─── Route Guards ───────────────────────────────────────────────
export { withAuthProtection } from './lib/withAuthProtection';

// ─── Strategy Types & Factory ──────────────────────────────────
export type {
  PersistenceStrategyBase as PersistenceStrategy,
} from './strategies/PersistenceStrategyBase';

export {
  createBrowserPersistenceStrategy
} from './strategies/factory/createBrowserPersistenceStrategy';

export {
  LocalStorageStrategyImpl
} from './strategies/implementations/LocalStorageStrategyImpl';

export {
  NavigationStateStrategyImpl
} from './strategies/implementations/NavigationStateStrategyImpl';

// ─── Axios HTTP Layer ──────────────────────────────────────────
export { axiosApp, axiosAuth } from './lib/axiosClient';

// ─── Utilities ─────────────────────────────────────────────────
export { config } from './lib/config';
export { auditLoginEvent, auditLogoutEvent } from './lib/auditLogger';

// ─── Schema Validation ─────────────────────────────────────────
export { validateSchema } from './lib/validateSchema';

// ─── Auth Mappers (Forced Re-export) ───────────────────────────
import { mapAuth0ToAuthUser as _mapAuth0ToAuthUser } from './context/auth/mappers/mapAuth0ToAuthUser';
export const mapAuth0ToAuthUser = _mapAuth0ToAuthUser;

import { mapFirebaseToAuthUser as _mapFirebaseToAuthUser } from './context/auth/mappers/mapFirebaseToAuthUser';
export const mapFirebaseToAuthUser = _mapFirebaseToAuthUser;

// ─── Auth Context Providers (React Only) ───────────────────────
import { FirebaseAuthContextProvider as _FirebaseAuthContextProvider } from './context/auth/FirebaseAuthContextProvider';
export const FirebaseAuthContextProvider = _FirebaseAuthContextProvider;

import { Auth0AuthContextProvider as _Auth0AuthContextProvider } from './context/auth/Auth0AuthContextProvider';
export const Auth0AuthContextProvider = _Auth0AuthContextProvider;

import { DummyAuthContextProvider as _DummyAuthContextProvider } from './context/auth/DummyAuthContextProvider';
export const DummyAuthContextProvider = _DummyAuthContextProvider;
