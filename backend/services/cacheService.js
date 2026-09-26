/**
 * Cache & Request Deduplication Service
 * High-performance in-memory cache with configurable TTL and in-flight request deduplication.
 * Prevents redundant external API calls and optimizes system response latency.
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.inflightPromises = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      deduped: 0
    };
  }

  /**
   * Get cached entry if valid and unexpired
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set cache entry with TTL in milliseconds
   */
  set(key, value, ttlMs = 15 * 60 * 1000) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: new Date().toISOString()
    });
    return value;
  }

  /**
   * Get cached data or execute fetcher function with in-flight deduplication.
   * If 5 requests arrive concurrently for the same key, fetcher is called ONLY once.
   */
  async getOrFetch(key, fetcherFn, ttlMs = 15 * 60 * 1000) {
    // 1. Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // 2. Check if a request for this key is ALREADY in-flight
    if (this.inflightPromises.has(key)) {
      this.stats.deduped++;
      return this.inflightPromises.get(key);
    }

    // 3. Initiate new fetch request promise and store in inflight Map
    const fetchPromise = (async () => {
      try {
        const result = await fetcherFn();
        if (result !== undefined && result !== null) {
          this.set(key, result, ttlMs);
        }
        return result;
      } finally {
        this.inflightPromises.delete(key);
      }
    })();

    this.inflightPromises.set(key, fetchPromise);
    return fetchPromise;
  }

  invalidate(key) {
    this.cache.delete(key);
    this.inflightPromises.delete(key);
  }

  clear() {
    this.cache.clear();
    this.inflightPromises.clear();
  }

  getStats() {
    return {
      ...this.stats,
      cachedKeysCount: this.cache.size,
      inflightCount: this.inflightPromises.size
    };
  }
}

module.exports = new CacheService();
