/**
 * Production Rate Limiter Middleware
 * Features:
 * - In-memory sliding window bucket per IP / forward address
 * - Environment-configurable windows and thresholds
 * - Standard RateLimit & Retry-After HTTP headers
 * - Periodic memory cleanup to prevent memory exhaustion
 * - Test harness support via x-test-rate-limit header
 */

function createRateLimiter({
  windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  max = parseInt(process.env.RATE_LIMIT_MAX || "40", 10),
  message = "Too many requests. Please wait a moment."
} = {}) {
  const hits = new Map();
  let lastPrune = Date.now();

  const prune = (now) => {
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) {
        hits.delete(key);
      }
    }
    lastPrune = now;
  };

  return (req, res, next) => {
    // In automated test environments, bypass rate limiting UNLESS explicitly testing rate limits
    const isTest = process.env.NODE_ENV === "test";
    const forceTestRateLimit = Boolean(req.headers["x-test-rate-limit"]);
    if (isTest && !forceTestRateLimit) {
      return next();
    }

    const now = Date.now();
    // Prune stale buckets periodically (every 30s or when map exceeds 2000 entries)
    if (now - lastPrune > 30000 || hits.size > 2000) {
      prune(now);
    }

    const clientIp = (req.ip || req.socket?.remoteAddress || "127.0.0.1")
      .toString()
      .split(",")[0]
      .trim();

    // If testing rate limit with unique test key, use it
    const testKey = (isTest && req.headers["x-test-rate-limit-key"]) || clientIp;
    const entry = hits.get(testKey) || { start: now, count: 0 };

    if (now - entry.start > windowMs) {
      entry.start = now;
      entry.count = 0;
    }

    entry.count += 1;
    hits.set(testKey, entry);

    const remaining = Math.max(0, max - entry.count);
    const resetTimeSec = Math.ceil((entry.start + windowMs - now) / 1000);

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", Math.max(0, resetTimeSec));

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.max(1, resetTimeSec));
      return res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        error: message,
        message,
        retryAfter: resetTimeSec
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
