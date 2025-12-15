import { createMMKV } from 'react-native-mmkv';
import { appConfig } from '@core/config/appConfig';
import { logger } from '@core/utils/logger';

/**
 * Key-value storage interface
 */
export interface KeyValueStorage {
  /**
   * Get value by key
   */
  get(key: string): string | undefined;

  /**
   * Set value for key
   */
  set(key: string, value: string): void;

  /**
   * Remove value by key
   */
  remove(key: string): void;

  /**
   * Clear all values
   */
  clear(): void;

  /**
   * Check if key exists
   */
  contains(key: string): boolean;

  /**
   * Get all keys
   */
  getAllKeys(): string[];
}

/**
 * Async key-value storage interface
 */
export interface AsyncKeyValueStorage {
  /**
   * Get value by key
   */
  get(key: string): Promise<string | null>;

  /**
   * Set value for key
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Remove value by key
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all values
   */
  clear(): Promise<void>;

  /**
   * Check if key exists
   */
  contains(key: string): Promise<boolean>;

  /**
   * Get all keys
   */
  getAllKeys(): Promise<string[]>;
}

/**
 * MMKV storage implementation (synchronous, fast)
 */
class MMKVStorage implements KeyValueStorage {
  private storage: ReturnType<typeof createMMKV>;

  constructor(id: string = 'default') {
    this.storage = createMMKV({ id });
  }

  get(key: string): string | undefined {
    return this.storage.getString(key);
  }

  set(key: string, value: string): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.remove(key);
  }

  clear(): void {
    this.storage.clearAll();
  }

  contains(key: string): boolean {
    return this.storage.contains(key);
  }

  getAllKeys(): string[] {
    return this.storage.getAllKeys();
  }
}

/**
 * Promise-based storage wrapper around MMKV (synchronous under the hood)
 */
class AsyncMMKVStorageImpl implements AsyncKeyValueStorage {
  constructor(private storage: KeyValueStorage) {}

  async get(key: string): Promise<string | null> {
    try {
      return this.storage.get(key) ?? null;
    } catch (error) {
      logger.error('AsyncMMKVStorage', 'Failed to get item', error);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      this.storage.set(key, value);
    } catch (error) {
      logger.error('AsyncMMKVStorage', 'Failed to set item', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      this.storage.remove(key);
    } catch (error) {
      logger.error('AsyncMMKVStorage', 'Failed to remove item', error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
    } catch (error) {
      logger.error('AsyncMMKVStorage', 'Failed to clear', error);
    }
  }

  async contains(key: string): Promise<boolean> {
    try {
      return this.storage.contains(key);
    } catch (error) {
      logger.error('AsyncMMKVStorage', 'Failed to check if key exists', error);
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return this.storage.getAllKeys();
    } catch (error) {
      logger.error('AsyncMMKVStorage', 'Failed to get all keys', error);
      return [];
    }
  }
}

/**
 * Typed storage helper for JSON serialization
 */
export class TypedStorage<T> {
  constructor(
    private storage: KeyValueStorage,
    private key: string
  ) {}

  /**
   * Get typed value
   */
  get(): T | undefined {
    try {
      const value = this.storage.get(this.key);
      if (value === undefined) return undefined;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('TypedStorage', `Failed to get ${this.key}`, error);
      return undefined;
    }
  }

  /**
   * Set typed value
   */
  set(value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.set(this.key, serialized);
    } catch (error) {
      logger.error('TypedStorage', `Failed to set ${this.key}`, error);
    }
  }

  /**
   * Remove value
   */
  remove(): void {
    this.storage.remove(this.key);
  }

  /**
   * Check if value exists
   */
  exists(): boolean {
    return this.storage.contains(this.key);
  }
}

/**
 * Async typed storage helper for JSON serialization
 */
export class AsyncTypedStorage<T> {
  constructor(
    private storage: AsyncKeyValueStorage,
    private key: string
  ) {}

  /**
   * Get typed value
   */
  async get(): Promise<T | undefined> {
    try {
      const value = await this.storage.get(this.key);
      if (value === null) return undefined;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('AsyncTypedStorage', `Failed to get ${this.key}`, error);
      return undefined;
    }
  }

  /**
   * Set typed value
   */
  async set(value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.storage.set(this.key, serialized);
    } catch (error) {
      logger.error('AsyncTypedStorage', `Failed to set ${this.key}`, error);
    }
  }

  /**
   * Remove value
   */
  async remove(): Promise<void> {
    await this.storage.remove(this.key);
  }

  /**
   * Check if value exists
   */
  async exists(): Promise<boolean> {
    return await this.storage.contains(this.key);
  }
}

/**
 * Create prefixed key
 */
function createKey(key: string): string {
  return `${appConfig.storagePrefix}${key}`;
}

/**
 * MMKV storage instance (default, fast)
 */
export const mmkvStorage = new MMKVStorage();

/**
 * Promise-based storage instance (MMKV-backed)
 */
export const asyncStorage = new AsyncMMKVStorageImpl(mmkvStorage);

/**
 * Create typed MMKV storage
 */
export function createTypedStorage<T>(key: string): TypedStorage<T> {
  return new TypedStorage<T>(mmkvStorage, createKey(key));
}

/**
 * Create async typed storage
 */
export function createAsyncTypedStorage<T>(key: string): AsyncTypedStorage<T> {
  return new AsyncTypedStorage<T>(asyncStorage, createKey(key));
}
