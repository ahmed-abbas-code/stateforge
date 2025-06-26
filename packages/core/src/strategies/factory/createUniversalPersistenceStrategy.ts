// packages/core/src/strategies/factory/createUniversalPersistenceStrategy.ts
import { createBrowserPersistenceStrategy } from './createBrowserPersistenceStrategy';
import { createServerPersistenceStrategy } from './createServerPersistenceStrategy';
import type { PersistenceStrategy, PersistenceStrategyBase } from '../../types/PersistenceOptions';

export function createUniversalPersistenceStrategy<T>(
  type: PersistenceStrategy,
  namespace?: string
): PersistenceStrategyBase<T> {
  switch (type) {
    case 'localStorage':
    case 'navigationState':
      return createBrowserPersistenceStrategy(type);

    case 'restApi':
    case 'firestore':
    case 'redis':
      return createServerPersistenceStrategy({ type, namespace });

    default:
      throw new Error(`[StateForge] Unknown persistence strategy: "${type}"`);
  }
}
