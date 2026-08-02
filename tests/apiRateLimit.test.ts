import { describe, expect, it, vi } from 'vitest';
import { checkProfileAgentRateLimit, PROFILE_AGENT_RATE_LIMIT_ID } from '../src/utils/apiRateLimit';

const request = new Request('https://dg-os.com/api/chat', {
  headers: { 'x-real-ip': '203.0.113.10' },
});

describe('Profile Agent rate limiting', () => {
  it('bypasses the platform check outside Vercel', async () => {
    const checker = vi.fn();
    await expect(checkProfileAgentRateLimit(request, { runtime: {}, checker })).resolves.toEqual({
      allowed: true,
      reason: 'allowed',
    });
    expect(checker).not.toHaveBeenCalled();
  });

  it('uses the Vercel Firewall rule and platform request identity', async () => {
    const checker = vi.fn().mockResolvedValue({ rateLimited: true });
    await expect(
      checkProfileAgentRateLimit(request, { runtime: { VERCEL: '1' }, checker })
    ).resolves.toEqual({ allowed: false, reason: 'rate_limited' });
    expect(checker).toHaveBeenCalledWith(PROFILE_AGENT_RATE_LIMIT_ID, { request });
  });

  it('fails closed when the Firewall rule is missing or unavailable', async () => {
    const missingRule = vi.fn().mockResolvedValue({ rateLimited: false, error: 'not-found' });
    await expect(
      checkProfileAgentRateLimit(request, {
        runtime: { VERCEL: 'true' },
        checker: missingRule,
      })
    ).resolves.toEqual({ allowed: false, reason: 'unavailable' });

    const unavailable = vi.fn().mockRejectedValue(new Error('Firewall unavailable'));
    await expect(
      checkProfileAgentRateLimit(request, {
        runtime: { VERCEL: '1' },
        checker: unavailable,
      })
    ).resolves.toEqual({ allowed: false, reason: 'unavailable' });
  });
});
