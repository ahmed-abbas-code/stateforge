// strategies/factory/createBrowserPersistenceStrategy.ts

import { LocalStorageStrategyImpl } from '../implementations/LocalStorageStrategyImpl';
import { NavigationStateStrategyImpl } from '../implementations/NavigationStateStrategyImpl';

export function createBrowserPersistenceStrategy<T>(
  type: 'localStorage' | 'navigationState',
  namespace = 'app'
) {
  return type === 'localStorage'
    ? new LocalStorageStrategyImpl<T>(namespace)
    : new NavigationStateStrategyImpl<T>(namespace);
}
