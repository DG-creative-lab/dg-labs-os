import { runAnthropicAdapter, runAnthropicStreamAdapter } from './llmGatewayAdapters/anthropic';
import { runGeminiAdapter, runGeminiStreamAdapter } from './llmGatewayAdapters/gemini';
import { runOpenAiAdapter, runOpenAiStreamAdapter } from './llmGatewayAdapters/openai';
import { runOpenRouterAdapter, runOpenRouterStreamAdapter } from './llmGatewayAdapters/openrouter';
import type {
  LlmGatewayRequest,
  LlmGatewayResult,
  LlmGatewayStreamResult,
} from './llmGatewayTypes';

export type {
  LlmGatewayErrorCode,
  LlmGatewayMessage,
  LlmGatewayRequest,
  LlmGatewayResult,
  LlmGatewayStreamEvent,
  LlmGatewayStreamResult,
  LlmProvider,
} from './llmGatewayTypes';

const DEFAULT_TIMEOUT_MS = 45_000;

export const runLlmGateway = async (request: LlmGatewayRequest): Promise<LlmGatewayResult> => {
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  switch (request.provider) {
    case 'openai':
      return runOpenAiAdapter(request, timeoutMs);
    case 'anthropic':
      return runAnthropicAdapter(request, timeoutMs);
    case 'gemini':
      return runGeminiAdapter(request, timeoutMs);
    case 'openrouter':
      return runOpenRouterAdapter(request, timeoutMs);
    default:
      return {
        ok: false,
        code: 'CONFIG_ERROR',
        message: `Unsupported provider: ${request.provider}`,
      };
  }
};

export const runLlmGatewayStream = async (
  request: LlmGatewayRequest
): Promise<LlmGatewayStreamResult> => {
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  switch (request.provider) {
    case 'openai':
      return runOpenAiStreamAdapter(request, timeoutMs);
    case 'anthropic':
      return runAnthropicStreamAdapter(request, timeoutMs);
    case 'gemini':
      return runGeminiStreamAdapter(request, timeoutMs);
    case 'openrouter':
      return runOpenRouterStreamAdapter(request, timeoutMs);
    default:
      return {
        ok: false,
        code: 'PROVIDER_ERROR',
        message: `Streaming is not supported for ${request.provider} yet.`,
        hint: 'Use a streaming-capable provider.',
      };
  }
};
