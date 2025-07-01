import { PersistenceStrategyBase } from '@core/common/types/PersistenceOptions';
import { firestore } from '../../lib/firestore';

export class FirestoreStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly collection: string;

  constructor(namespace: string = 'app_state') {
    this.collection = namespace;
  }

  async get(key: string): Promise<T | undefined> {
    try {
      const docRef = firestore.collection(this.collection).doc(key);
      const docSnap = await docRef.get();

      if (!docSnap.exists) return undefined;

      const data = docSnap.data();
      if (!data || typeof data.value === 'undefined') {
        console.warn(`[Firestore] Document "${key}" in "${this.collection}" exists but has no 'value' field.`);
        return undefined;
      }

      return data.value as T;
    } catch (err) {
      console.error(`[FirestoreStrategy] Failed to get key "${key}" from "${this.collection}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      const docRef = firestore.collection(this.collection).doc(key);
      await docRef.set({ value }, { merge: true });
    } catch (err) {
      console.error(`[FirestoreStrategy] Failed to set key "${key}" in "${this.collection}":`, err);
    }
  }
}
