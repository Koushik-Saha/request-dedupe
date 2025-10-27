/**
 * Options for the dedupe function
 */
export interface DedupeOptions {
  /** Cache duration in milliseconds (default: 100ms) */
  duration?: number;
  /** Custom key generator function */
  keyGenerator?: (key: string) => string;
  /** Clear cache on error (default: true) */
  clearOnError?: boolean;
}

/**
 * Cache entry containing the promise and metadata
 */
export interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
  count: number;
}

/**
 * Deduplicator instance
 */
export interface Deduplicator {
  dedupe: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
  clear: (key?: string) => void;
  has: (key: string) => boolean;
  size: () => number;
}
