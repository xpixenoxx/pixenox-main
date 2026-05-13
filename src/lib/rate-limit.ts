import { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Note: Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in Vercel
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Initialize Upstash Rate Limiter if Redis is configured
const upstashRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '24 h'),
      analytics: true,
      prefix: 'pixenox:ratelimit',
    })
  : null;

// Fallback in-memory store for local dev without keys
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const localStore = new Map<string, RateLimitEntry>();

// Garbage-collect expired entries for local memory store
if (!upstashRatelimit) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of localStore.entries()) {
      if (now > entry.resetAt) localStore.delete(key);
    }
  }, 60_000);
}

export interface RateLimitConfig {
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  limit: 3,
  windowSeconds: 86400, // 24 hours in seconds
};

/**
 * Returns { success: true } if the request is allowed.
 * Falls back to in-memory if Upstash env vars are missing.
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ success: boolean; retryAfterSeconds?: number }> {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  
  // Use Upstash Redis if configured
  if (upstashRatelimit) {
    try {
      const { success, reset } = await upstashRatelimit.limit(ip);
      if (!success) {
        const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000);
        return { success: false, retryAfterSeconds: Math.max(0, retryAfterSeconds) };
      }
      return { success: true };
    } catch (error) {
      console.error('Upstash rate limit error:', error);
      // Fallback on error so we don't drop legitimate traffic
      return { success: true };
    }
  }

  // Fallback to in-memory for local dev
  const key = `rl:${ip}`;
  const now = Date.now();
  const entry = localStore.get(key);

  if (!entry || now > entry.resetAt) {
    localStore.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { success: true };
  }

  if (entry.count < config.limit) {
    entry.count++;
    return { success: true };
  }

  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
  return { success: false, retryAfterSeconds };
}
