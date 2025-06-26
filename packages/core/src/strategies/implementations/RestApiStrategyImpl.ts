import { PersistenceStrategyBase } from '../../types/PersistenceOptions';
import { fetchAppApi } from '../../utils/fetchAppApi';

export class RestApiStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly namespace: string;

  constructor(namespace: string = 'default') {
    this.namespace = namespace;
  }

  private withNamespace(key: string): string {
    return `${this.namespace}:${key}`;
  }

  async get(key: string): Promise<T | undefined> {
    const namespacedKey = this.withNamespace(key);

    try {
      const response = await fetchAppApi.get(`/state/${namespacedKey}`);

      if (!response?.data?.value) {
        console.warn(`[RestApiStrategy] No value returned for key "${key}" (namespaced: "${namespacedKey}")`);
        return undefined;
      }

      return response.data.value as T;
    } catch (err) {
      console.error(`[RestApiStrategy] Failed to GET key "${key}" (namespaced: "${namespacedKey}")`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    const namespacedKey = this.withNamespace(key);

    try {
      await fetchAppApi.post(`/state/${namespacedKey}`, { value });
    } catch (err) {
      console.error(`[RestApiStrategy] Failed to POST key "${key}" (namespaced: "${namespacedKey}")`, err);
    }
  }
}
