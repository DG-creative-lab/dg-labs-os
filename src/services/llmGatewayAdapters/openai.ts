import type {
  LlmGatewayRequest,
  LlmGatewayResult,
  LlmGatewayMessage,
  LlmGatewayStreamEvent,
  LlmGatewayStreamResult,
} from '../llmGatewayTypes';
import {
  classifyProviderFailure,
  classifyTransportFailure,
  extractOpenAiResponseDelta,
  parseJsonSseStream,
} from '../llmGatewayShared';
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

export const runOpenAiAdapter = async (
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

export const runOpenAiStreamAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayStreamResult> => {
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
        stream: true,
        input: mapToOpenAiInput(request.messages),
      }),
      signal: abort.signal,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const failure = classifyProviderFailure(response.status, 'OpenAI', bodyText);
      return { ok: false, ...failure };
    }

    async function* stream(): AsyncGenerator<LlmGatewayStreamEvent> {
      let finalMessage = '';
      try {
        for await (const { payload } of parseJsonSseStream(response)) {
          if (!payload || typeof payload !== 'object') continue;
          const type = (payload as Record<string, unknown>).type;

          if (type === 'response.output_text.delta') {
            const delta = extractOpenAiResponseDelta(payload);
            if (delta) {
              finalMessage += delta;
              yield { type: 'delta', delta };
            }
            continue;
          }

          if (type === 'response.completed') {
            const content = normalizeOpenAiResponseText(
              (payload as Record<string, unknown>).response ?? payload
            );
            if (content && content.length > finalMessage.length) {
              finalMessage = content;
            }
          }

          if (type === 'error') {
            const message =
              typeof (payload as Record<string, unknown>).message === 'string'
                ? ((payload as Record<string, unknown>).message as string)
                : 'OpenAI streaming request failed.';
            yield { type: 'error', code: 'PROVIDER_ERROR', message };
            return;
          }
        }

        if (!finalMessage.trim()) {
          yield {
            type: 'error',
            code: 'INVALID_RESPONSE',
            message: 'Received invalid response from provider.',
          };
          return;
        }

        yield { type: 'done', message: finalMessage.trim() };
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
        message: 'OpenAI request timed out.',
        hint: 'Increase timeout, retry later, or enable provider fallback.',
      };
    }
    return { ok: false, ...classifyTransportFailure('OpenAI', errorMessage) };
  }
};
