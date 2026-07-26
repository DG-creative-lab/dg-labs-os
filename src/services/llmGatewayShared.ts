import type { LlmGatewayErrorCode } from './llmGatewayTypes';
const normalizeLower = (value: string) => value.toLowerCase();

export const classifyProviderFailure = (
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

export const classifyTransportFailure = (
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

export const normalizeAssistantContent = (content: unknown): string | null => {
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

export const extractOpenRouterDelta = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const choices = record.choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0];
  if (!first || typeof first !== 'object') return null;
  const delta = (first as Record<string, unknown>).delta;
  if (!delta || typeof delta !== 'object') return null;
  const content = (delta as Record<string, unknown>).content;
  return typeof content === 'string' && content.length > 0 ? content : null;
};

export const extractOpenAiResponseDelta = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  return typeof record.delta === 'string' && record.delta.length > 0 ? record.delta : null;
};

export async function* parseJsonSseStream(
  response: Response,
  onPayload?: (payload: unknown) => void
): AsyncGenerator<{ event: string; payload: unknown }> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    let boundaryIndex = buffer.indexOf('\n\n');
    while (boundaryIndex !== -1) {
      const block = buffer.slice(0, boundaryIndex);
      buffer = buffer.slice(boundaryIndex + 2);
      const eventLines = block.split('\n').map((line) => line.trimEnd());
      const eventName =
        eventLines
          .find((line) => line.startsWith('event:'))
          ?.slice(6)
          .trim() || 'message';
      const lines = eventLines
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart());

      if (lines.length > 0) {
        const raw = lines.join('\n');
        if (raw === '[DONE]') return;
        try {
          const payload = JSON.parse(raw) as unknown;
          onPayload?.(payload);
          yield { event: eventName, payload };
        } catch {
          // ignore malformed event frames
        }
      }
      boundaryIndex = buffer.indexOf('\n\n');
    }

    if (done) break;
  }
}
