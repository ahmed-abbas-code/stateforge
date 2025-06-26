// ─── Persistence Factory (Node-only: Firestore, Redis, etc.) ───────
export {
  createServerPersistenceStrategy,
} from './strategies/factory/createServerPersistenceStrategy';

// ─── Firebase Admin SDK (SSR/server-side only) ─────────────────────
export { firebaseAdmin } from './lib/firebase-admin';
export { firestore } from './lib/firestore';

// ─── Redis Integration (Node-only) ─────────────────────────────────
export { redis } from './lib/redis';

// ─── Server-side Auth Verification ────────────────────────────────
export { verifyFirebaseToken } from './lib/verifyFirebaseToken';

export { useUniversalPersistedFramework } from './hooks/useUniversalPersistedFramework';
