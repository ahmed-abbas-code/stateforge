// src/state/client/strategies/factory/createBrowserPersistenceStrategy.ts

import { LocalStorageStrategyImpl, NavigationStateStrategyImpl } from "@state/client";


export function createBrowserPersistenceStrategy<T>(
  type: 'localStorage' | 'navigationState',
  namespace = 'app'
) {
  return type === 'localStorage'
    ? new LocalStorageStrategyImpl<T>(namespace)
    : new NavigationStateStrategyImpl<T>(namespace);
}
