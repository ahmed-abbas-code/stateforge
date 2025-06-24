import { PersistenceStrategyBase } from '@/types/PersistenceOptions';
import { firestore } from '@/lib/firestore';

export class FirestoreStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private collection: string;

  constructor(namespace: string = 'app_state') {
    this.collection = namespace;
  }

  async get(key: string): Promise<T | undefined> {
    try {
      const doc = await firestore.collection(this.collection).doc(key).get();
      return doc.exists ? (doc.data()?.value as T) : undefined;
    } catch (err) {
      console.error(`[Firestore] Failed to get key "${key}" from collection "${this.collection}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      await firestore.collection(this.collection).doc(key).set({ value });
    } catch (err) {
      console.error(`[Firestore] Failed to set key "${key}" in collection "${this.collection}":`, err);
    }
  }
}
