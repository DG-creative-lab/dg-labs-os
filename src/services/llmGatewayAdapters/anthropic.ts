import type {
  LlmGatewayRequest,
  LlmGatewayResult,
  LlmGatewayStreamEvent,
  LlmGatewayStreamResult,
} from '../llmGatewayTypes';
import {
  classifyProviderFailure,
  classifyTransportFailure,
  parseJsonSseStream,
} from '../llmGatewayShared';
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

export const runAnthropicAdapter = async (
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

export const runAnthropicStreamAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayStreamResult> => {
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
        stream: true,
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

    async function* stream(): AsyncGenerator<LlmGatewayStreamEvent> {
      let finalMessage = '';
      try {
        for await (const { event, payload } of parseJsonSseStream(response)) {
          if (!payload || typeof payload !== 'object') continue;

          if (event === 'content_block_delta') {
            const deltaRecord = (payload as Record<string, unknown>).delta;
            const delta =
              deltaRecord &&
              typeof deltaRecord === 'object' &&
              typeof (deltaRecord as Record<string, unknown>).text === 'string'
                ? ((deltaRecord as Record<string, unknown>).text as string)
                : '';
            if (delta) {
              finalMessage += delta;
              yield { type: 'delta', delta };
            }
            continue;
          }

          if (event === 'error') {
            const errorObj = (payload as Record<string, unknown>).error;
            const message =
              errorObj &&
              typeof errorObj === 'object' &&
              typeof (errorObj as Record<string, unknown>).message === 'string'
                ? ((errorObj as Record<string, unknown>).message as string)
                : 'Anthropic streaming request failed.';
            yield { type: 'error', code: 'PROVIDER_ERROR', message };
            return;
          }
        }

        const normalized = finalMessage.trim();
        if (!normalized) {
          yield {
            type: 'error',
            code: 'INVALID_RESPONSE',
            message: 'Received invalid response from provider.',
          };
          return;
        }

        yield { type: 'done', message: normalized };
      } finally {
        clearTimeout(timer);
      }
    }

    return { ok: true, stream: stream() };
  } catch (error) {
    clearTimeout(timer);
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
  }
};
