export type PersistenceStrategy =
  | 'localStorage'
  | 'restApi'
  | 'firestore'
  | 'redis'
  | 'encryptedStorage'
  | 'redis-server'
  | 'firestore-server'
  | 'navigationState';

export interface PersistenceStrategyBase<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
}
