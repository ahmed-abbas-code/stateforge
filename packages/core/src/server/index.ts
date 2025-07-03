export * from './lib/auditLogger';

// ✅ Use centralized config store instead of legacy config files
export * from '../common/utils/getFrameworkConfig';

export * from './lib/firebase';
export * from './lib/firebase-admin';
export * from './lib/firestore';
export * from './lib/redis';
export * from './lib/verifyFirebaseToken';

// Middleware
export * from './middleware/auditLoggerMiddleware';
export * from './middleware/autoLogout';
export * from './middleware/ipGuard';
export * from './middleware/rateLimiter';
export * from './middleware/withAuthValidation';
export * from './middleware/withSSOGuard';

// Server-side Strategies
export * from './strategies/implementations/FirestoreStrategyImpl';
export * from './strategies/implementations/RedisServerStrategyImpl';
export * from './strategies/implementations/RestApiStrategyImpl';
export * from './strategies/factory/createServerPersistenceStrategy';

// Utils
export * from './utils/axiosClient';
