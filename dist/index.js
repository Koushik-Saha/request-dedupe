"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  clearDedupe: () => clearDedupe,
  createDeduplicator: () => createDeduplicator,
  dedupe: () => dedupe,
  dedupeCacheSize: () => dedupeCacheSize,
  hasDedupe: () => hasDedupe
});
module.exports = __toCommonJS(src_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clearDedupe,
  createDeduplicator,
  dedupe,
  dedupeCacheSize,
  hasDedupe
});
