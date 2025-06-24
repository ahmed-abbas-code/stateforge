// packages/core/src/strategies/PersistenceStrategyBase.ts
/**
 * Base interface for all persistence strategies.
 * Used to define a generic persistence contract.
 */
export interface PersistenceStrategyBase<T = any> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
}
