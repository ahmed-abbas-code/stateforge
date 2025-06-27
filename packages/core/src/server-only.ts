import { isDryRunEnv } from './lib/isDryRunEnv';

export { createServerPersistenceStrategy } from './strategies/factory/createServerPersistenceStrategy';

export { verifyFirebaseToken } from './lib/verifyFirebaseToken';
export { useUniversalPersistedFramework } from './hooks/useUniversalPersistedFramework';

if (!isDryRunEnv) {
  // Export server-only modules only if not in dryrun mode
  module.exports.firebaseAdmin = require('./lib/firebase-admin').firebaseAdmin;
  module.exports.firestore = require('./lib/firestore').firestore;
  module.exports.redis = require('./lib/redis').redis;
}
