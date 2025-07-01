/**
 * Base interface for all persistence strategies.
 * Used to define a generic persistence contract.
 */
export interface PersistenceStrategyBase<T = unknown> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
}
