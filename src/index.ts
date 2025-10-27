import { DedupeOptions, CacheEntry, Deduplicator } from "./types";

/**
 * Create a deduplicator instance with optional configuration
 */
export function createDeduplicator(options: DedupeOptions = {}): Deduplicator {
  const { duration = 100, clearOnError = true } = options;

  const cache = new Map<string, CacheEntry<any>>();

  /**
   * Deduplicate concurrent requests by key
   * If a request with the same key is already in-flight, return that promise
   * instead of creating a new one
   */
  const dedupe = async <T>(
    key: string,
    fetcher: () => Promise<T>,
  ): Promise<T> => {
    if (!key || typeof key !== "string") {
      throw new Error("Key must be a non-empty string");
    }

    // Check if request already exists
    if (cache.has(key)) {
      const entry = cache.get(key)!;
      entry.count += 1;
      return entry.promise;
    }

    // Create new promise
    const promise = fetcher()
      .then((result) => {
        // Success - clear cache after duration
        setTimeout(() => cache.delete(key), duration);
        return result;
      })
      .catch((error) => {
        // Error handling
        if (clearOnError) {
          cache.delete(key);
        } else {
          setTimeout(() => cache.delete(key), duration);
        }
        throw error;
      });

    // Store in cache
    cache.set(key, { promise, timestamp: Date.now(), count: 1 });

    return promise;
  };

  /**
   * Clear cache by key or clear entire cache
   */
  const clear = (key?: string): void => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  };

  /**
   * Check if key exists in cache
   */
  const has = (key: string): boolean => {
    return cache.has(key);
  };

  /**
   * Get current cache size
   */
  const size = (): number => {
    return cache.size;
  };

  return { dedupe, clear, has, size };
}

// Convenience: Default instance
const defaultDeduplicator = createDeduplicator();
export const dedupe = defaultDeduplicator.dedupe;
export const clearDedupe = defaultDeduplicator.clear;
export const hasDedupe = defaultDeduplicator.has;
export const dedupeCacheSize = defaultDeduplicator.size;

// Export types
export type { DedupeOptions, CacheEntry, Deduplicator };
