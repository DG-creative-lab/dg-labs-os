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

export const runGeminiAdapter = async (
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

export const runGeminiStreamAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayStreamResult> => {
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
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': request.apiKey,
      },
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

    async function* stream(): AsyncGenerator<LlmGatewayStreamEvent> {
      let finalMessage = '';
      try {
        for await (const { payload } of parseJsonSseStream(response)) {
          const delta = normalizeGeminiResponseText(payload);
          if (delta) {
            finalMessage += delta;
            yield { type: 'delta', delta };
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
        message: 'Gemini request timed out.',
        hint: 'Increase timeout, retry later, or enable provider fallback.',
      };
    }
    return { ok: false, ...classifyTransportFailure('Gemini', errorMessage) };
  }
};
