import { useEffect, useState } from 'react';
import type { ProviderHealth } from './terminalTypes';
import type { TerminalSettings } from '../utils/terminalSettings';

export const fetchTerminalProviderHealth = async (
  settings: Pick<TerminalSettings, 'llmProvider' | 'llmModel'>,
  byokApiKey: string
): Promise<ProviderHealth> => {
  try {
    const response = await fetch('/api/llm/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.llmProvider,
        model: settings.llmModel,
        byokApiKey: byokApiKey.trim().length > 0 ? byokApiKey.trim() : undefined,
        probe: true,
      }),
    });
    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      providers?: Array<{
        provider?: unknown;
        configured?: unknown;
        status?: unknown;
        message?: unknown;
        latencyMs?: unknown;
      }>;
    } | null;

    const provider = payload?.providers?.[0];
    if (!provider) {
      return {
        provider: settings.llmProvider,
        status: 'error',
        configured: false,
        message: 'Provider health check failed.',
      };
    }
    const status =
      provider.status === 'healthy' ||
      provider.status === 'missing_key' ||
      provider.status === 'timeout' ||
      provider.status === 'error'
        ? provider.status
        : 'error';
    return {
      provider: settings.llmProvider,
      status,
      configured: typeof provider.configured === 'boolean' ? provider.configured : false,
      message:
        typeof provider.message === 'string' && provider.message.trim().length > 0
          ? provider.message
          : 'Provider health check failed.',
      latencyMs: typeof provider.latencyMs === 'number' ? provider.latencyMs : undefined,
    };
  } catch {
    return {
      provider: settings.llmProvider,
      status: 'error',
      configured: false,
      message: 'Health check failed. Check network or API key.',
    };
  }
};

export const useTerminalProviderHealth = (
  settings: TerminalSettings,
  byokApiKey: string
): ProviderHealth => {
  const [providerHealth, setProviderHealth] = useState<ProviderHealth>({
    provider: 'openrouter',
    status: 'checking',
    message: 'Checking provider health...',
    configured: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isActive = true;
    const timer = window.setTimeout(async () => {
      setProviderHealth((prev) => ({
        ...prev,
        provider: settings.llmProvider,
        status: 'checking',
        message: 'Checking provider health...',
      }));

      const health = await fetchTerminalProviderHealth(settings, byokApiKey);
      if (isActive) setProviderHealth(health);
    }, 250);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [settings.llmProvider, settings.llmModel, byokApiKey]);

  return providerHealth;
};
