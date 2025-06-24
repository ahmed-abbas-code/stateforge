import { PersistenceStrategyBase } from '@/types/PersistenceOptions';
import { fetchAppApi } from '@/utils/fetchAppApi';

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
      return response.data?.value as T;
    } catch (err) {
      console.error(`[RestApi] Failed to get key "${key}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    const namespacedKey = this.withNamespace(key);

    try {
      await fetchAppApi.post(`/state/${namespacedKey}`, { value });
    } catch (err) {
      console.error(`[RestApi] Failed to set key "${key}":`, err);
    }
  }
}
