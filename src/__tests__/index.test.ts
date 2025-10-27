import { createDeduplicator, dedupe } from "../index";

describe("Request Deduplicator", () => {
  it("should deduplicate identical requests", async () => {
    const dedup = createDeduplicator();
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return { data: "test" };
    };

    // Make 3 requests simultaneously with same key
    const results = await Promise.all([
      dedup.dedupe("key1", fetcher),
      dedup.dedupe("key1", fetcher),
      dedup.dedupe("key1", fetcher),
    ]);

    // Should only call fetcher once
    expect(callCount).toBe(1);
    expect(results).toEqual([
      { data: "test" },
      { data: "test" },
      { data: "test" },
    ]);
  });

  it("should differentiate between different keys", async () => {
    const dedup = createDeduplicator();
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return { id: callCount };
    };

    const results = await Promise.all([
      dedup.dedupe("key1", fetcher),
      dedup.dedupe("key2", fetcher),
      dedup.dedupe("key3", fetcher),
    ]);

    // Should call fetcher 3 times (different keys)
    expect(callCount).toBe(3);
    expect(results[0]).toEqual({ id: 1 });
    expect(results[1]).toEqual({ id: 2 });
    expect(results[2]).toEqual({ id: 3 });
  });

  it("should clear cache after duration", async () => {
    const dedup = createDeduplicator({ duration: 50 });
    let callCount = 0;

    const fetcher = async () => {
      callCount++;
      return { data: "test" };
    };

    await dedup.dedupe("key1", fetcher);
    expect(callCount).toBe(1);

    // Wait for cache to clear
    await new Promise((resolve) => setTimeout(resolve, 100));

    await dedup.dedupe("key1", fetcher);
    // Should call again (cache cleared)
    expect(callCount).toBe(2);
  });

  it("should handle errors", async () => {
    const dedup = createDeduplicator();
    const error = new Error("Fetch failed");

    const failingFetcher = async () => {
      throw error;
    };

    await expect(dedup.dedupe("key1", failingFetcher)).rejects.toThrow(
      "Fetch failed",
    );
  });

  it("should provide cache management methods", async () => {
    const dedup = createDeduplicator();

    const fetcher = async () => ({ data: "test" });

    expect(dedup.has("key1")).toBe(false);

    dedup.dedupe("key1", fetcher);
    expect(dedup.has("key1")).toBe(true);
    expect(dedup.size()).toBe(1);

    dedup.clear("key1");
    expect(dedup.has("key1")).toBe(false);
    expect(dedup.size()).toBe(0);
  });

  it("should work with default instance", async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      return { data: "test" };
    };

    await dedupe("test-key", fetcher);
    await dedupe("test-key", fetcher);

    expect(callCount).toBe(1);
  });

  it("should validate key input", async () => {
    const dedup = createDeduplicator();
    const fetcher = async () => ({ data: "test" });

    await expect(dedup.dedupe("", fetcher)).rejects.toThrow(
      "Key must be a non-empty string",
    );
  });
});
