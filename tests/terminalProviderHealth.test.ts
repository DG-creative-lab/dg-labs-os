import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultTerminalSettings, type TerminalSettings } from '../src/utils/terminalSettings';
import { fetchTerminalProviderHealth } from '../src/services/useTerminalProviderHealth';

const mockFetch = vi.fn();

afterEach(() => {
  mockFetch.mockReset();
  vi.unstubAllGlobals();
});

describe('terminal provider health client', () => {
  it('sends the selected provider with a trimmed BYOK key and returns a healthy result', async () => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          providers: [
            {
              provider: 'openai',
              configured: true,
              status: 'healthy',
              message: 'Ready',
              latencyMs: 42,
            },
          ],
        }),
        { status: 200 }
      )
    );
    const settings: TerminalSettings = {
      ...defaultTerminalSettings,
      llmProvider: 'openai',
      llmModel: 'gpt-4.1-mini',
    };

    await expect(fetchTerminalProviderHealth(settings, '  byok-key  ')).resolves.toEqual({
      provider: 'openai',
      status: 'healthy',
      configured: true,
      message: 'Ready',
      latencyMs: 42,
    });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      provider: 'openai',
      model: 'gpt-4.1-mini',
      byokApiKey: 'byok-key',
      probe: true,
    });
  });

  it('normalizes missing or malformed provider results to an error state', async () => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ providers: [] }), { status: 200 }));

    await expect(fetchTerminalProviderHealth(defaultTerminalSettings, '')).resolves.toEqual({
      provider: 'openrouter',
      status: 'error',
      configured: false,
      message: 'Provider health check failed.',
    });
  });

  it('returns a stable error result when the health request fails', async () => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockRejectedValue(new Error('network down'));

    await expect(fetchTerminalProviderHealth(defaultTerminalSettings, '')).resolves.toEqual({
      provider: 'openrouter',
      status: 'error',
      configured: false,
      message: 'Health check failed. Check network or API key.',
    });
  });
});
