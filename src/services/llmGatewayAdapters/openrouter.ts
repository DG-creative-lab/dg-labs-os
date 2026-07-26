import { OpenRouter } from '@openrouter/sdk';
import type {
  LlmGatewayRequest,
  LlmGatewayResult,
  LlmGatewayStreamEvent,
  LlmGatewayStreamResult,
} from '../llmGatewayTypes';
import {
  classifyProviderFailure,
  classifyTransportFailure,
  extractOpenRouterDelta,
  normalizeAssistantContent,
  parseJsonSseStream,
} from '../llmGatewayShared';
export const runOpenRouterStreamAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayStreamResult> => {
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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${request.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
      signal: abort.signal,
    });

    if (!response.ok) {
      const bodyText = await response.text();
      const failure = classifyProviderFailure(response.status, 'OpenRouter', bodyText);
      return { ok: false, ...failure };
    }

    async function* stream(): AsyncGenerator<LlmGatewayStreamEvent> {
      let finalMessage = '';
      try {
        for await (const { payload } of parseJsonSseStream(response)) {
          const delta = extractOpenRouterDelta(payload);
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
            hint: 'Retry later or switch provider.',
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
  }
};

export const runOpenRouterAdapter = async (
  request: LlmGatewayRequest,
  timeoutMs: number
): Promise<LlmGatewayResult> => {
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
