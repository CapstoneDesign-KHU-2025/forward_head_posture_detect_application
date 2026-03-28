import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining?: number;
  retryAfterMs?: number;
};

export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const fullKey = `ratelimit:${key}`;

  const count = await redis.incr(fullKey);

  if (count === 1) {
    await redis.expire(fullKey, Math.floor(options.windowMs / 1000));
  }

  if (count > options.max) {
    const ttl = await redis.ttl(fullKey);
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: ttl > 0 ? ttl * 1000 : options.windowMs,
    };
  }

  return {
    ok: true,
    remaining: options.max - count,
  };
}
