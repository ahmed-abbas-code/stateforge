// packages/core/src/strategies/factory/createServerPersistenceStrategy.ts

import { FirestoreStrategyImpl, RedisServerStrategyImpl, RestApiStrategyImpl } from '@core/server/index';
import { isStrategyIdentifier, PersistenceStrategy, PersistenceStrategyBase, STRATEGY_TYPES } from '@core/common/types/PersistenceOptions';

type StrategyConfig<T> = {
  type: PersistenceStrategy<T>;
  namespace?: string;
};

export function createServerPersistenceStrategy<T>(
  config: StrategyConfig<T>
): PersistenceStrategyBase<T> {
  const { type, namespace = 'default' } = config;

  if (!isStrategyIdentifier(type)) {
    // Already an implementation — return directly
    return type;
  }

  switch (type) {
    case STRATEGY_TYPES.REST_API:
      return new RestApiStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.FIRESTORE:
      return new FirestoreStrategyImpl<T>(namespace);
    case STRATEGY_TYPES.REDIS_SERVER:
      return new RedisServerStrategyImpl<T>(namespace);
    default:
      throw new Error(`[StateForge] Unsupported server strategy type: "${type}"`);
  }
}
