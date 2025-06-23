// === Public Contexts ===
export { AppStateContext, AppStateProvider } from './context/state/AppStateContext';
export { NavigationStateContext, NavigationStateProvider } from './context/state/NavigationStateContext';

export {
  AuthContext,
  useAuth,
} from './context/auth/AuthContext';

export {
  UnifiedAuthStrategySelector as AuthProvider,
} from './context/auth/UnifiedAuthStrategySelector';

// === Public Hooks ===
export { usePersistedFramework } from './hooks/usePersistedFramework';
export { useNavigationPersistedState } from './hooks/useNavigationPersistedState';

// === Strategy Types & Factory ===
export type {
  PersistenceStrategy,
} from './strategies/PersistenceStrategyBase';

export {
  createPersistenceStrategy,
} from './lib/createPersistenceStrategy';

// === Axios HTTP Layer ===
export {
  axiosApp,
  axiosAuth,
} from './lib/axiosClient';

// === Utilities ===
export { config } from './lib/config';
export { auditLoginEvent, auditLogoutEvent } from './lib/auditLogger';
export { verifyFirebaseToken } from './lib/verifyFirebaseToken';

// === Optional Firebase SDK (e.g. for SSR usage)
export { auth } from './lib/firebase';
