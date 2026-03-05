// src/lib/rateLimit.ts
import { Redis } from "@upstash/redis";

// Upstash는 환경 변수 UPSTASH_REDIS_REST_URL와
// UPSTASH_REDIS_REST_TOKEN를 자동으로 읽어옵니다.
const redis = Redis.fromEnv();

export type RateLimitOptions = {
  windowMs: number; // 제한 시간 (밀리초)
  max: number; // 허용 횟수
};

export type RateLimitResult = {
  ok: boolean;
  remaining?: number;
  retryAfterMs?: number;
};

/**
 * Redis 기반 레이트 리밋 체크
 */
export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const fullKey = `ratelimit:${key}`;

  // 1. 카운트 증가 (원자적 연산)
  const count = await redis.incr(fullKey);

  // 2. 처음 생성된 키라면 만료 시간 설정
  if (count === 1) {
    // windowMs를 초 단위로 변환 (Redis EXPIRE는 초 단위 기준)
    await redis.expire(fullKey, Math.floor(options.windowMs / 1000));
  }

  // 3. 제한 초과 확인
  if (count > options.max) {
    const ttl = await redis.ttl(fullKey); // 남은 시간(초) 조회
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: ttl > 0 ? ttl * 1000 : options.windowMs,
    };
  }

  // 4. 통과
  return {
    ok: true,
    remaining: options.max - count,
  };
}
