import type { APIRoute } from 'astro';
import { jsonResponse, errorResponse } from '../../../utils/apiResponse';
import { getServerEnv } from '../../../utils/serverEnv';
import { runLlmGateway, type LlmProvider } from '../../../services/llmGateway';
import { defaultModelForProvider } from '../../../services/llmProviderDefaults';

type ProviderHealthStatus = 'healthy' | 'missing_key' | 'timeout' | 'error';

type ProviderHealth = {
  provider: LlmProvider;
  configured: boolean;
  status: ProviderHealthStatus;
  message: string;
  latencyMs?: number;
};

const providers: LlmProvider[] = ['openrouter', 'openai', 'anthropic', 'gemini'];

const parseProvider = (value: unknown): LlmProvider | null => {
  if (value === 'openrouter' || value === 'openai' || value === 'anthropic' || value === 'gemini') {
    return value;
  }
  return null;
};

const readServerKey = (provider: LlmProvider): string | undefined => {
  if (provider === 'openrouter') return getServerEnv('OPENROUTER_API_KEY');
  if (provider === 'openai') return getServerEnv('OPENAI_API_KEY');
  if (provider === 'anthropic') return getServerEnv('ANTHROPIC_API_KEY');
  return getServerEnv('GEMINI_API_KEY');
};

const probeProvider = async ({
  provider,
  apiKey,
  model,
  probe,
}: {
  provider: LlmProvider;
  apiKey?: string;
  model?: string;
  probe: boolean;
}): Promise<ProviderHealth> => {
  if (!apiKey) {
    return {
      provider,
      configured: false,
      status: 'missing_key',
      message: 'No API key configured for this provider.',
    };
  }

  if (!probe) {
    return {
      provider,
      configured: true,
      status: 'healthy',
      message: 'API key detected.',
    };
  }

  const started = Date.now();
  const gateway = await runLlmGateway({
    provider,
    model: model || defaultModelForProvider(provider),
    apiKey,
    timeoutMs: 6000,
    messages: [{ role: 'user', content: 'ping' }],
  });
  const latencyMs = Date.now() - started;

  if (gateway.ok) {
    return {
      provider,
      configured: true,
      status: 'healthy',
      message: 'Provider probe succeeded.',
      latencyMs,
    };
  }

  if (gateway.code === 'TIMEOUT') {
    return {
      provider,
      configured: true,
      status: 'timeout',
      message: gateway.message,
      latencyMs,
    };
  }

  if (gateway.code === 'CONFIG_ERROR') {
    return {
      provider,
      configured: false,
      status: 'missing_key',
      message: gateway.message,
      latencyMs,
    };
  }

  return {
    provider,
    configured: true,
    status: 'error',
    message: gateway.message,
    latencyMs,
  };
};

type HealthRequestBody = {
  provider?: LlmProvider;
  model?: string;
  byokApiKey?: string;
  probe?: boolean;
};

const handleRequest = async (body: HealthRequestBody): Promise<Response> => {
  const selectedProvider = body.provider && parseProvider(body.provider);
  const probe = body.probe !== false;
  const providerList = selectedProvider ? [selectedProvider] : providers;

  const statusByProvider = await Promise.all(
    providerList.map(async (provider) =>
      probeProvider({
        provider,
        model: body.model,
        probe,
        apiKey:
          selectedProvider === provider && body.byokApiKey && body.byokApiKey.trim().length > 0
            ? body.byokApiKey.trim()
            : readServerKey(provider),
      })
    )
  );

  return jsonResponse(
    {
      ok: true,
      probe,
      providers: statusByProvider,
      timestamp: new Date().toISOString(),
    },
    200,
    true
  );
};

export const GET: APIRoute = async ({ request, url }) => {
  const resolvedUrl = url ?? new URL(request.url);
  const providerParam = parseProvider(resolvedUrl.searchParams.get('provider'));
  const probeParam = resolvedUrl.searchParams.get('probe');
  const probe = probeParam === null ? true : probeParam === '1' || probeParam === 'true';
  return handleRequest({ provider: providerParam ?? undefined, probe });
};

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('INVALID_JSON', 'Invalid request format', 400, true);
  }

  const record =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  if (!record) return errorResponse('INVALID_BODY', 'Invalid health payload', 400, true);

  const provider = parseProvider(record.provider);
  const model = typeof record.model === 'string' ? record.model : undefined;
  const byokApiKey = typeof record.byokApiKey === 'string' ? record.byokApiKey : undefined;
  const probe = typeof record.probe === 'boolean' ? record.probe : true;

  return handleRequest({
    provider: provider ?? undefined,
    model,
    byokApiKey,
    probe,
  });
};
