import { OpenRouter } from '@openrouter/sdk';

export type LlmProvider = 'openrouter' | 'openai' | 'anthropic' | 'gemini';

export type LlmGatewayMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LlmGatewayRequest = {
  provider: LlmProvider;
  model: string;
  messages: readonly LlmGatewayMessage[];
  apiKey?: string;
  timeoutMs?: number;
};

export type LlmGatewayErrorCode =
  | 'CONFIG_ERROR'
  | 'INVALID_RESPONSE'
  | 'TIMEOUT'
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'PROVIDER_ERROR';

export type LlmGatewayResult =
  | { ok: true; message: string }
  | { ok: false; code: LlmGatewayErrorCode; message: string; hint?: string };

const normalizeLower = (value: string) => value.toLowerCase();

const classifyProviderFailure = (
  status: number,
  providerLabel: string,
  bodyText: string
): { code: LlmGatewayErrorCode; message: string; hint: string } => {
  const body = normalizeLower(bodyText);

  if (
    status === 401 ||
    status === 403 ||
    body.includes('invalid api key') ||
    body.includes('incorrect api key') ||
    body.includes('authentication') ||
    body.includes('unauthorized') ||
    body.includes('permission denied')
  ) {
    return {
      code: 'INVALID_KEY',
      message: `${providerLabel} rejected the API key.`,
      hint: 'Add a valid BYOK key or switch to a configured provider.',
    };
  }

  if (status === 429 && (body.includes('quota') || body.includes('insufficient_quota'))) {
    return {
      code: 'QUOTA_EXCEEDED',
      message: `${providerLabel} quota was exceeded.`,
      hint: 'Use a different provider or refresh the provider key with available quota.',
    };
  }

  if (status === 429) {
    return {
      code: 'RATE_LIMITED',
      message: `${providerLabel} rate limit was reached.`,
      hint: 'Retry later or enable provider fallback.',
    };
  }

  return {
    code: 'PROVIDER_ERROR',
    message: `${providerLabel} returned an upstream error (${status}).`,
    hint: 'Try again later or switch provider.',
  };
};

const classifyTransportFailure = (
  providerLabel: string,
  errorMessage: string
): { code: LlmGatewayErrorCode; message: string; hint: string } => {
  const text = normalizeLower(errorMessage);
  if (text.includes('timeout') || text.includes('abort')) {
    return {
      code: 'TIMEOUT',
      message: `${providerLabel} request timed out.`,
      hint: 'Increase timeout, retry later, or enable provider fallback.',
    };
  }

  if (
    text.includes('fetch failed') ||
    text.includes('network') ||
    text.includes('enotfound') ||
    text.includes('econnreset') ||
    text.includes('socket')
  ) {
    return {
      code: 'NETWORK_ERROR',
      message: `Network error while contacting ${providerLabel}.`,
      hint: 'Check connectivity or switch provider.',
    };
  }

  if (
    text.includes('invalid api key') ||
    text.includes('incorrect api key') ||
    text.includes('unauthorized')
  ) {
    return {
      code: 'INVALID_KEY',
      message: `${providerLabel} rejected the API key.`,
      hint: 'Add a valid BYOK key or switch to a configured provider.',
    };
  }

  if (text.includes('quota')) {
    return {
      code: 'QUOTA_EXCEEDED',
      message: `${providerLabel} quota was exceeded.`,
      hint: 'Use a different provider or refresh the provider key with available quota.',
    };
  }

  if (text.includes('rate limit') || text.includes('too many requests')) {
    return {
      code: 'RATE_LIMITED',
      message: `${providerLabel} rate limit was reached.`,
      hint: 'Retry later or enable provider fallback.',
    };
  }

  return {
    code: 'PROVIDER_ERROR',
    message: `${providerLabel} returned an unexpected error.`,
    hint: 'Try again later or switch provider.',
  };
};

const normalizeAssistantContent = (content: unknown): string | null => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return null;

  const textParts = content
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const record = item as Record<string, unknown>;
      if (typeof record.text === 'string') return record.text;
      if (typeof record.content === 'string') return record.content;
      return '';
    })
    .filter(Boolean);

  if (textParts.length > 0) return textParts.join('\n').trim();
  return null;
};

const mapToOpenAiInput = (messages: readonly LlmGatewayMessage[]) =>
  messages.map((message) => ({
    type: 'message',
    role: message.role,
    content: [{ type: 'input_text', text: message.content }],
  }));

const normalizeOpenAiResponseText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  if (typeof record.output_text === 'string' && record.output_text.trim().length > 0) {
    return record.output_text.trim();
  }

  const output = record.output;
  if (!Array.isArray(output)) return null;

  const textParts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const itemRecord = item as Record<string, unknown>;
    const content = itemRecord.content;
    if (!Array.isArray(content)) continue;
    for (const chunk of content) {
      if (!chunk || typeof chunk !== 'object') continue;
      const chunkRecord = chunk as Record<string, unknown>;
      if (typeof chunkRecord.text === 'string') textParts.push(chunkRecord.text);
    }
  }

  if (textParts.length === 0) return null;
  return textParts.join('\n').trim();
};

const runOpenAiAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayResult> => {
  if (!request.apiKey) {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: 'OpenAI API key is missing.',
    };
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'gpt-4.1-mini',
        store: false,
        input: mapToOpenAiInput(request.messages),
      }),
      signal: abort.signal,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const failure = classifyProviderFailure(response.status, 'OpenAI', bodyText);
      return { ok: false, ...failure };
    }

    const payload = (await response.json()) as unknown;
    const content = normalizeOpenAiResponseText(payload);
    if (!content) {
      return {
        ok: false,
        code: 'INVALID_RESPONSE',
        message: 'Received invalid response from provider.',
      };
    }

    return { ok: true, message: content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof DOMException || errorMessage.toLowerCase().includes('abort')) {
      return {
        ok: false,
        code: 'TIMEOUT',
        message: 'OpenAI request timed out.',
        hint: 'Increase timeout, retry later, or enable provider fallback.',
      };
    }
    return { ok: false, ...classifyTransportFailure('OpenAI', errorMessage) };
  } finally {
    clearTimeout(timer);
  }
};

const normalizeAnthropicResponseText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const content = record.content;
  if (!Array.isArray(content)) return null;

  const textParts = content
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const chunk = item as Record<string, unknown>;
      if (chunk.type === 'text' && typeof chunk.text === 'string') return chunk.text;
      return '';
    })
    .filter(Boolean);

  if (textParts.length === 0) return null;
  return textParts.join('\n').trim();
};

const runAnthropicAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayResult> => {
  if (!request.apiKey) {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: 'Anthropic API key is missing.',
    };
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

  try {
    const systemParts = request.messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content.trim())
      .filter(Boolean);
    const messages = request.messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': request.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || 'claude-3-5-sonnet-latest',
        max_tokens: 900,
        system: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
        messages,
      }),
      signal: abort.signal,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const failure = classifyProviderFailure(response.status, 'Anthropic', bodyText);
      return { ok: false, ...failure };
    }

    const payload = (await response.json()) as unknown;
    const content = normalizeAnthropicResponseText(payload);
    if (!content) {
      return {
        ok: false,
        code: 'INVALID_RESPONSE',
        message: 'Received invalid response from provider.',
      };
    }

    return { ok: true, message: content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof DOMException || errorMessage.toLowerCase().includes('abort')) {
      return {
        ok: false,
        code: 'TIMEOUT',
        message: 'Anthropic request timed out.',
        hint: 'Increase timeout, retry later, or enable provider fallback.',
      };
    }
    return { ok: false, ...classifyTransportFailure('Anthropic', errorMessage) };
  } finally {
    clearTimeout(timer);
  }
};

const normalizeGeminiResponseText = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const candidates = record.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const first = candidates[0];
  if (!first || typeof first !== 'object') return null;
  const firstRecord = first as Record<string, unknown>;
  const content = firstRecord.content;
  if (!content || typeof content !== 'object') return null;
  const contentRecord = content as Record<string, unknown>;
  const parts = contentRecord.parts;
  if (!Array.isArray(parts)) return null;

  const text = parts
    .map((part) => {
      if (!part || typeof part !== 'object') return '';
      const partRecord = part as Record<string, unknown>;
      return typeof partRecord.text === 'string' ? partRecord.text : '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();

  return text.length > 0 ? text : null;
};

const runGeminiAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayResult> => {
  if (!request.apiKey) {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: 'Gemini API key is missing.',
    };
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

  try {
    const systemParts = request.messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content.trim())
      .filter(Boolean);

    const contents = request.messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));

    const model = request.model || 'gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(request.apiKey)}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(systemParts.length > 0
          ? {
              systemInstruction: {
                parts: [{ text: systemParts.join('\n\n') }],
              },
            }
          : {}),
        contents,
      }),
      signal: abort.signal,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const failure = classifyProviderFailure(response.status, 'Gemini', bodyText);
      return { ok: false, ...failure };
    }

    const payload = (await response.json()) as unknown;
    const content = normalizeGeminiResponseText(payload);
    if (!content) {
      return {
        ok: false,
        code: 'INVALID_RESPONSE',
        message: 'Received invalid response from provider.',
      };
    }

    return { ok: true, message: content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof DOMException || errorMessage.toLowerCase().includes('abort')) {
      return {
        ok: false,
        code: 'TIMEOUT',
        message: 'Gemini request timed out.',
        hint: 'Increase timeout, retry later, or enable provider fallback.',
      };
    }
    return { ok: false, ...classifyTransportFailure('Gemini', errorMessage) };
  } finally {
    clearTimeout(timer);
  }
};

export const runLlmGateway = async (request: LlmGatewayRequest): Promise<LlmGatewayResult> => {
  const timeoutMs = request.timeoutMs ?? 45000;

  if (request.provider === 'openai') return runOpenAiAdapter(request, timeoutMs);
  if (request.provider === 'anthropic') return runAnthropicAdapter(request, timeoutMs);
  if (request.provider === 'gemini') return runGeminiAdapter(request, timeoutMs);

  if (request.provider !== 'openrouter') {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: `Unsupported provider: ${request.provider}`,
    };
  }

  if (!request.apiKey) {
    return {
      ok: false,
      code: 'CONFIG_ERROR',
      message: 'OpenRouter API key is missing.',
      hint: 'Configure a server key or add a BYOK key for OpenRouter.',
    };
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);

  try {
    const openRouter = new OpenRouter({
      apiKey: request.apiKey,
    });

    const completion = await openRouter.chat.send(
      {
        model: request.model,
        messages: [...request.messages],
        stream: false,
        temperature: 0.7,
        maxTokens: 500,
      },
      { signal: abort.signal }
    );

    const content = normalizeAssistantContent(completion?.choices?.[0]?.message?.content);
    if (!content) {
      return {
        ok: false,
        code: 'INVALID_RESPONSE',
        message: 'Received invalid response from provider.',
        hint: 'Retry later or switch provider.',
      };
    }

    return { ok: true, message: content };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (
      error instanceof DOMException ||
      errorMessage.toLowerCase().includes('timeout') ||
      errorMessage.toLowerCase().includes('abort')
    ) {
      return {
        ok: false,
        code: 'TIMEOUT',
        message: 'OpenRouter request timed out.',
        hint: 'Increase timeout, retry later, or enable provider fallback.',
      };
    }
    return { ok: false, ...classifyTransportFailure('OpenRouter', errorMessage) };
  } finally {
    clearTimeout(timer);
  }
};
