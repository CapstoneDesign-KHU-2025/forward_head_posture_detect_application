const store = new Map<
  string,
  {
    count: number;
    resetAt: number;
  }
>();

export type RateLimitOptions = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining?: number;
  retryAfterMs?: number;
};

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      ok: true,
      remaining: options.max - 1,
    };
  }

  if (current.count >= options.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: current.resetAt - now,
    };
  }

  current.count += 1;

  return {
    ok: true,
    remaining: options.max - current.count,
  };
}

