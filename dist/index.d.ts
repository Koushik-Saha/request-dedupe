/**
 * Options for the dedupe function
 */
interface DedupeOptions {
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
interface CacheEntry<T> {
    promise: Promise<T>;
    timestamp: number;
    count: number;
}
/**
 * Deduplicator instance
 */
interface Deduplicator {
    dedupe: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
    clear: (key?: string) => void;
    has: (key: string) => boolean;
    size: () => number;
}

/**
 * Create a deduplicator instance with optional configuration
 */
declare function createDeduplicator(options?: DedupeOptions): Deduplicator;
declare const dedupe: <T>(key: string, fetcher: () => Promise<T>) => Promise<T>;
declare const clearDedupe: (key?: string) => void;
declare const hasDedupe: (key: string) => boolean;
declare const dedupeCacheSize: () => number;

export { CacheEntry, DedupeOptions, Deduplicator, clearDedupe, createDeduplicator, dedupe, dedupeCacheSize, hasDedupe };
