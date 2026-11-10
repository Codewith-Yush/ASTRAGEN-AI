// In-memory sliding window rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 10 * 60 * 1000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // Periodic pruning if store exceeds 1000 entries
  if (rateLimitStore.size > 1000) {
    for (const [k, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetTime - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  existing.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}
