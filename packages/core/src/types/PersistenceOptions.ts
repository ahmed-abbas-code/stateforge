// ─── Strategy Identifiers (Enum-like) ─────────────────────────────

export const STRATEGY_TYPES = {
  LOCAL_STORAGE: 'localStorage',
  REST_API: 'restApi',
  FIRESTORE: 'firestore',
  REDIS: 'redis',
  ENCRYPTED_STORAGE: 'encryptedStorage',
  REDIS_SERVER: 'redis-server',
  FIRESTORE_SERVER: 'firestore-server',
  NAVIGATION_STATE: 'navigationState',
} as const;

// ─── Literal Union Type Derived from Enum ─────────────────────────

export type PersistenceStrategy = typeof STRATEGY_TYPES[keyof typeof STRATEGY_TYPES];

// ─── Generic Strategy Contract Interface ──────────────────────────

export interface PersistenceStrategyBase<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
}
