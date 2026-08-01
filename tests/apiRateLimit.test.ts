import { beforeEach, describe, expect, it } from 'vitest';
import { consumeApiRateLimit, resetApiRateLimitsForTests } from '../src/utils/apiRateLimit';

describe('API rate limiting', () => {
  beforeEach(() => resetApiRateLimitsForTests());

  it('limits repeated requests from the same forwarded address', () => {
    const request = new Request('http://localhost/api/chat', {
      headers: { 'x-forwarded-for': '203.0.113.10' },
    });

    expect(consumeApiRateLimit(request, 'test', 2, 60_000).allowed).toBe(true);
    expect(consumeApiRateLimit(request, 'test', 2, 60_000).allowed).toBe(true);
    const blocked = consumeApiRateLimit(request, 'test', 2, 60_000);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('isolates scopes and client addresses', () => {
    const first = new Request('http://localhost/api/chat', {
      headers: { 'x-real-ip': '198.51.100.20' },
    });
    const second = new Request('http://localhost/api/chat', {
      headers: { 'x-real-ip': '198.51.100.21' },
    });

    expect(consumeApiRateLimit(first, 'chat', 1).allowed).toBe(true);
    expect(consumeApiRateLimit(first, 'chat', 1).allowed).toBe(false);
    expect(consumeApiRateLimit(first, 'stream', 1).allowed).toBe(true);
    expect(consumeApiRateLimit(second, 'chat', 1).allowed).toBe(true);
  });
});
