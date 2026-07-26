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

export type LlmGatewayStreamEvent =
  | { type: 'delta'; delta: string }
  | { type: 'done'; message: string }
  | { type: 'error'; code: LlmGatewayErrorCode; message: string; hint?: string };

export type LlmGatewayStreamResult =
  | { ok: true; stream: AsyncGenerator<LlmGatewayStreamEvent> }
  | { ok: false; code: LlmGatewayErrorCode; message: string; hint?: string };
