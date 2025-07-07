// src/state/server/strategies/factory/createServerPersistenceStrategy.ts

import { FirestoreStrategyImpl, RedisServerStrategyImpl, RestApiStrategyImpl } from "@state/server";
import { PersistenceStrategyBase } from "@state/shared";
import { isStrategyIdentifier, PersistenceStrategy, STRATEGY_TYPES } from "@state/shared/types/PersistenceOptions";

type StrategyConfig<T> = {
  type: PersistenceStrategy<T>;
  namespace?: string;
};

// Dummy fallback implementation (no-op)
class DummyStrategy<T> implements PersistenceStrategyBase<T> {
  constructor(private namespace: string) {}

  async get(): Promise<T | undefined> {
    return undefined;
  }

  async set(): Promise<void> {}

  async clear(): Promise<void> {}
}

export function createServerPersistenceStrategy<T>(
  config: StrategyConfig<T>
): PersistenceStrategyBase<T> {
  const { type, namespace = 'default' } = config;

  if (!isStrategyIdentifier(type)) {
    return type;
  }

  switch (type) {
    case STRATEGY_TYPES.REST_API:
      return new RestApiStrategyImpl<T>(namespace);

    case STRATEGY_TYPES.FIRESTORE:
      try {
        return new FirestoreStrategyImpl<T>(namespace);
      } catch {
        console.warn('[StateForge] FirestoreStrategyImpl unavailable, using DummyStrategy.');
        return new DummyStrategy<T>(namespace);
      }

    case STRATEGY_TYPES.REDIS_SERVER:
      try {
        return new RedisServerStrategyImpl<T>(namespace);
      } catch {
        console.warn('[StateForge] RedisServerStrategyImpl unavailable, using DummyStrategy.');
        return new DummyStrategy<T>(namespace);
      }

    default:
      throw new Error(`[StateForge] Unsupported server strategy type: "${type}"`);
  }
}
