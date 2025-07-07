// src/state/client/strategies/implementations/EncryptedStorageStrategyImpl.ts

import CryptoJS from 'crypto-js';
import { getClientEnvVar } from '@shared/utils/client';
import { PersistenceStrategyBase } from '@state/shared';

export class EncryptedStorageStrategyImpl<T> implements PersistenceStrategyBase<T> {
  private readonly namespace: string;

  constructor(namespace: string = 'default') {
    this.namespace = namespace;
  }

  private withNamespace(key: string): string {
    return `${this.namespace}:${key}`;
  }

  private getSecret(): string {
    if (typeof window === 'undefined') {
      throw new Error('[EncryptedStorage] Tried to access client env var on server');
    }
    return getClientEnvVar('NEXT_PUBLIC_AUTH_ENCRYPTION_SECRET');
  }

  async get(key: string): Promise<T | undefined> {
    if (typeof window === 'undefined') return undefined;

    try {
      const encrypted = localStorage.getItem(this.withNamespace(key));
      if (!encrypted) return undefined;

      const bytes = CryptoJS.AES.decrypt(encrypted, this.getSecret());
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) throw new Error('Decryption returned empty string');

      return JSON.parse(decrypted) as T;
    } catch (err) {
      console.error(`[EncryptedStorage] Failed to decrypt key "${key}":`, err);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const stringified = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(stringified, this.getSecret()).toString();

      localStorage.setItem(this.withNamespace(key), encrypted);
    } catch (err) {
      console.error(`[EncryptedStorage] Failed to encrypt key "${key}":`, err);
    }
  }
}
