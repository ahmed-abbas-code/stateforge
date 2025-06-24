// ───────────────────────────────────────────────────────────────
// Ensure this file is treated as a runtime module so TS emits JS.
export const __ensureRuntimeEmit = true;

// ─── Public Types ───────────────────────────────────────────────
export type {
  AppSharedState,
  AppStateContextType,
} from '@/types/AppState';

export type {
  AuthUser,
  AuthContextType,
} from '@/types/Auth';

export type {
  NavigationState,
  NavigationStateContextType,
} from '@/types/NavigationState';

// Optional wildcard: future types in /types will be auto-exposed.
export * from '@/types';

// ─── Public Contexts ────────────────────────────────────────────
export {
  AppStateContext,
  AppStateProvider,
  useAppState,
} from '@/context/state/AppStateContext';

export {
  NavigationStateContext,
  NavigationStateProvider,
} from '@/context/state/NavigationStateContext';

export {
  AuthContext,
  useAuth,
} from '@/context/auth/AuthContext';

export {
  UnifiedAuthStrategySelector as AuthProvider,
} from '@/context/auth/UnifiedAuthStrategySelector';

// ─── Public Hooks ───────────────────────────────────────────────
export { usePersistedFramework } from '@/hooks/usePersistedFramework';
export { useNavigationPersistedState } from '@/hooks/useNavigationPersistedState';

// ─── Route Guards ───────────────────────────────────────────────
export { withAuthProtection } from '@/lib/withAuthProtection';

// ─── Strategy Types & Factory ──────────────────────────────────
export type {
  PersistenceStrategyBase as PersistenceStrategy,
} from '@/strategies/PersistenceStrategyBase';

export { createPersistenceStrategy } from '@/lib/createPersistenceStrategy';
export { NavigationStateStrategyImpl } from '@/strategies/implementations/NavigationStateStrategyImpl';


// ─── Axios HTTP Layer ──────────────────────────────────────────
export { axiosApp, axiosAuth } from '@/lib/axiosClient';

// ─── Utilities ─────────────────────────────────────────────────
export { config } from '@/lib/config';
export { auditLoginEvent, auditLogoutEvent } from '@/lib/auditLogger';
export { verifyFirebaseToken } from '@/lib/verifyFirebaseToken';

// ─── Optional Firebase / Redis (SSR only) ──────────────────────
export { auth } from '@/lib/firebase';
export { firebaseAdmin } from '@/lib/firebase-admin';
export { firestore } from '@/lib/firestore';
export { redis } from '@/lib/redis';
