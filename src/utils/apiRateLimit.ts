import { checkRateLimit } from '@vercel/firewall';

export const PROFILE_AGENT_RATE_LIMIT_ID = 'profile-agent-chat';

type FirewallChecker = typeof checkRateLimit;

type RateLimitRuntime = {
  [key: string]: string | undefined;
  VERCEL?: string;
};

export type ProfileAgentRateLimitDecision = {
  allowed: boolean;
  reason: 'allowed' | 'rate_limited' | 'unavailable';
};

const isVercelRuntime = (runtime: RateLimitRuntime): boolean =>
  runtime.VERCEL === '1' || runtime.VERCEL === 'true';

/**
 * Uses Vercel Firewall's distributed rate-limit service and its platform-owned
 * request identity. Local development bypasses the platform check. Production
 * fails closed if the matching Firewall rule is absent or unavailable.
 */
export const checkProfileAgentRateLimit = async (
  request: Request,
  options: {
    runtime?: RateLimitRuntime;
    checker?: FirewallChecker;
  } = {}
): Promise<ProfileAgentRateLimitDecision> => {
  const runtime = options.runtime ?? process.env;
  if (!isVercelRuntime(runtime)) return { allowed: true, reason: 'allowed' };

  try {
    const result = await (options.checker ?? checkRateLimit)(PROFILE_AGENT_RATE_LIMIT_ID, {
      request,
    });

    if (result.error === 'not-found') {
      return { allowed: false, reason: 'unavailable' };
    }
    if (result.rateLimited || result.error === 'blocked') {
      return { allowed: false, reason: 'rate_limited' };
    }
    return { allowed: true, reason: 'allowed' };
  } catch (error) {
    console.error(
      '[Profile Agent] Vercel Firewall rate-limit check failed:',
      error instanceof Error ? error.message : 'unknown error'
    );
    return { allowed: false, reason: 'unavailable' };
  }
};
