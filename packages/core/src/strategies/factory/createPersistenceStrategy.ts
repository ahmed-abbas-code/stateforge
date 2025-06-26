// packages/core/src/strategies/factory/createPersistenceStrategy.ts
import { isStrategyIdentifier, PersistenceStrategy, PersistenceStrategyBase, STRATEGY_TYPES } from '../../types/PersistenceOptions';
import { LocalStorageStrategyImpl } from '../implementations/LocalStorageStrategyImpl';
import { RestApiStrategyImpl } from '../implementations/RestApiStrategyImpl';
import { FirestoreStrategyImpl } from '../implementations/FirestoreStrategyImpl';
import { RedisServerStrategyImpl } from '../implementations/RedisServerStrategyImpl';
import { EncryptedStorageStrategyImpl } from '../implementations/EncryptedStorageStrategyImpl';

type StrategyConfig<T> = {
  type: PersistenceStrategy<T>;
  namespace?: string;
};

export function createPersistenceStrategy<T>(
  config: StrategyConfig<T>
): PersistenceStrategyBase<T> {
  const { type, namespace = 'default' } = config;

  if (!isStrategyIdentifier(type)) {
    // Already an implementation — return directly
    return type;
  }

  switch (type) {
    case STRATEGY_TYPES.LOCAL_STORAGE:
      return new LocalStorageStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.REST_API:
      return new RestApiStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.FIRESTORE:
      return new FirestoreStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.REDIS:
    case STRATEGY_TYPES.REDIS_SERVER:
      return new RedisServerStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.ENCRYPTED_STORAGE:
      return new EncryptedStorageStrategyImpl<T>(namespace);
    default:
      throw new Error(`[StateForge] Unsupported strategy type: "${type}"`);
  }
}
