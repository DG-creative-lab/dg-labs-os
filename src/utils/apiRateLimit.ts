type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requestBuckets = new Map<string, RateLimitEntry>();
const MAX_BUCKETS = 1000;

const requestIdentity = (request: Request): string =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-real-ip') ||
  'local';

const pruneExpiredBuckets = (now: number) => {
  if (requestBuckets.size < MAX_BUCKETS) return;
  for (const [key, entry] of requestBuckets) {
    if (entry.resetAt <= now) requestBuckets.delete(key);
  }
};

export const consumeApiRateLimit = (
  request: Request,
  scope: string,
  limit = 30,
  windowMs = 60_000
): { allowed: boolean; retryAfterSeconds: number } => {
  const now = Date.now();
  pruneExpiredBuckets(now);
  const key = `${scope}:${requestIdentity(request)}`;
  const current = requestBuckets.get(key);

  if (!current || current.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
};

export const resetApiRateLimitsForTests = () => requestBuckets.clear();
