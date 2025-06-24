import { PersistenceStrategy, PersistenceStrategyBase } from '@/types/PersistenceOptions';

import { LocalStorageStrategyImpl } from '@/strategies/implementations/LocalStorageStrategyImpl';
import { RestApiStrategyImpl } from '@/strategies/implementations/RestApiStrategyImpl';
import { FirestoreStrategyImpl } from '@/strategies/implementations/FirestoreStrategyImpl';
import { RedisServerStrategyImpl } from '@/strategies/implementations/RedisServerStrategyImpl';
import { EncryptedStorageStrategyImpl } from '@/strategies/implementations/EncryptedStorageStrategyImpl';

type StrategyConfig = {
  type: PersistenceStrategy;
  namespace?: string;
};

export function createPersistenceStrategy<T>(config: StrategyConfig): PersistenceStrategyBase<T> {
  const { type, namespace } = config;

  switch (type) {
    case 'localStorage':
      return new LocalStorageStrategyImpl<T>(namespace);
    case 'restApi':
      return new RestApiStrategyImpl<T>(namespace);
    case 'firestore':
      return new FirestoreStrategyImpl<T>(namespace);
    case 'redis':
      return new RedisServerStrategyImpl<T>(namespace);
    case 'encryptedStorage':
      return new EncryptedStorageStrategyImpl<T>(namespace);
    default:
      throw new Error(`[StateForge] Unsupported strategy "${type}"`);
  }
}
