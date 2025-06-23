import { PersistenceStrategy } from '../../types/persistence';
import { LocalStorageStrategy } from '../implementations/LocalStorageStrategy';
import { RestApiStrategy } from '../implementations/RestApiStrategy';
// import { FirestoreStrategy } from '../implementations/FirestoreStrategy';
// import { RedisStrategy } from '../implementations/RedisStrategy';
// import { EncryptedStorageStrategy } from '../implementations/EncryptedStorageStrategy';

interface PersistenceHandler<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
}

export function getPersistenceStrategy<T>(strategy: PersistenceStrategy): PersistenceHandler<T> {
  switch (strategy) {
    case 'localStorage':
      return new LocalStorageStrategy<T>();
    case 'restApi':
      return new RestApiStrategy<T>();
    // case 'firestore':
    //   return new FirestoreStrategy<T>();
    // case 'redis':
    //   return new RedisStrategy<T>();
    // case 'encryptedStorage':
    //   return new EncryptedStorageStrategy<T>();
    default:
      throw new Error(`[StateForge] Unsupported strategy "${strategy}"`);
  }
}
