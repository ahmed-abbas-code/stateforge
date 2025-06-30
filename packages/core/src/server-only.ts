import { isDryRunEnv } from './lib/isDryRunEnv.js';

export { createServerPersistenceStrategy } from './strategies/factory/createServerPersistenceStrategy.js';
export { verifyFirebaseToken } from './lib/verifyFirebaseToken.js';
export { useUniversalPersistedFramework } from './hooks/useUniversalPersistedFramework.js';

export const firebaseAdmin = isDryRunEnv
  ? null
  : (async () => (await import('./lib/firebase-admin.js')).firebaseAdmin)();

export const firestore = isDryRunEnv
  ? null
  : (async () => (await import('./lib/firestore.js')).firestore)();

export const redis = isDryRunEnv
  ? null
  : (async () => (await import('./lib/redis.js')).redis)();
