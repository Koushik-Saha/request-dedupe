// src/index.ts
function createDeduplicator(options = {}) {
  const {
    duration = 100,
    clearOnError = true
  } = options;
  const cache = /* @__PURE__ */ new Map();
  const dedupe2 = async (key, fetcher) => {
    if (!key || typeof key !== "string") {
      throw new Error("Key must be a non-empty string");
    }
    if (cache.has(key)) {
      const entry = cache.get(key);
      entry.count += 1;
      return entry.promise;
    }
    const promise = fetcher().then((result) => {
      setTimeout(() => cache.delete(key), duration);
      return result;
    }).catch((error) => {
      if (clearOnError) {
        cache.delete(key);
      } else {
        setTimeout(() => cache.delete(key), duration);
      }
      throw error;
    });
    cache.set(key, { promise, timestamp: Date.now(), count: 1 });
    return promise;
  };
  const clear = (key) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  };
  const has = (key) => {
    return cache.has(key);
  };
  const size = () => {
    return cache.size;
  };
  return { dedupe: dedupe2, clear, has, size };
}
var defaultDeduplicator = createDeduplicator();
var dedupe = defaultDeduplicator.dedupe;
var clearDedupe = defaultDeduplicator.clear;
var hasDedupe = defaultDeduplicator.has;
var dedupeCacheSize = defaultDeduplicator.size;
export {
  clearDedupe,
  createDeduplicator,
  dedupe,
  dedupeCacheSize,
  hasDedupe
};
