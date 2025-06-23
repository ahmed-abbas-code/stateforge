import { fetchAppApi } from '../../utils/fetchAppApi';

export class RestApiStrategy<T> {
  async get(key: string): Promise<T | undefined> {
    try {
      const response = await fetchAppApi.get(`/state/${key}`);
      return response.data?.value as T;
    } catch (err) {
      console.error(`[RestApi] Failed to get key "${key}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      await fetchAppApi.post(`/state/${key}`, { value });
    } catch (err) {
      console.error(`[RestApi] Failed to set key "${key}":`, err);
    }
  }
}
