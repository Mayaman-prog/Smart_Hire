const rateLimit = require("express-rate-limit");
const redis = require("../config/redis");

const GLOBAL_RATE_LIMIT_WINDOW_MS = Number(
  process.env.GLOBAL_RATE_LIMIT_WINDOW_MS || 60 * 1000,
);

const GLOBAL_RATE_LIMIT_MAX = Number(process.env.GLOBAL_RATE_LIMIT_MAX || 100);

// Redis store for express-rate-limit so counters work across server restarts and multiple backend instances.
class RedisRateLimitStore {
  constructor(prefix = "smart_hire:api_rate_limit") {
    this.prefix = prefix;
    this.windowMs = GLOBAL_RATE_LIMIT_WINDOW_MS;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  getRedisKey(key) {
    return `${this.prefix}:${key}`;
  }

  async increment(key) {
    const redisKey = this.getRedisKey(key);
    const totalHits = await redis.incr(redisKey);

    let ttl = await redis.pttl(redisKey);

    // The first request starts the expiry window.
    if (totalHits === 1 || ttl < 0) {
      await redis.pexpire(redisKey, this.windowMs);
      ttl = this.windowMs;
    }

    return {
      totalHits,
      resetTime: new Date(Date.now() + ttl),
    };
  }

  async decrement(key) {
    const redisKey = this.getRedisKey(key);
    const currentValue = await redis.decr(redisKey);

    if (currentValue <= 0) {
      await redis.del(redisKey);
    }
  }

  async resetKey(key) {
    await redis.del(this.getRedisKey(key));
  }
}

// Global API limiter: 100 requests per minute per IP.
const globalApiLimiter = rateLimit({
  windowMs: GLOBAL_RATE_LIMIT_WINDOW_MS,
  max: GLOBAL_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore(),
  message: {
    success: false,
    message: "Too many requests. Please try again after one minute.",
  },
});

module.exports = {
  globalApiLimiter,
};
