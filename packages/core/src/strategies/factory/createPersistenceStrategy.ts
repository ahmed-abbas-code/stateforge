import {
  STRATEGY_TYPES,
  PersistenceStrategy,
  PersistenceStrategyBase,
} from '@/types/PersistenceOptions';

import { LocalStorageStrategyImpl } from '@/strategies/implementations/LocalStorageStrategyImpl';
import { RestApiStrategyImpl } from '@/strategies/implementations/RestApiStrategyImpl';
import { FirestoreStrategyImpl } from '@/strategies/implementations/FirestoreStrategyImpl';
import { RedisServerStrategyImpl } from '@/strategies/implementations/RedisServerStrategyImpl';
import { EncryptedStorageStrategyImpl } from '@/strategies/implementations/EncryptedStorageStrategyImpl';

type StrategyConfig = {
  type: PersistenceStrategy;
  namespace?: string;
};

export function createPersistenceStrategy<T>(
  config: StrategyConfig
): PersistenceStrategyBase<T> {
  const { type, namespace = 'default' } = config;

  switch (type) {
    case STRATEGY_TYPES.LOCAL_STORAGE:
      return new LocalStorageStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.REST_API:
      return new RestApiStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.FIRESTORE:
      return new FirestoreStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.REDIS:
      return new RedisServerStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.ENCRYPTED_STORAGE:
      return new EncryptedStorageStrategyImpl<T>(namespace);
    default:
      throw new Error(`[StateForge] Unsupported strategy type "${type}"`);
  }
}
