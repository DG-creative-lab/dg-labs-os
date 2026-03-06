import type { LlmProvider } from './llmGateway';

export const defaultModelForProvider = (provider: LlmProvider): string => {
  switch (provider) {
    case 'openrouter':
      return 'openai/gpt-oss-120b';
    case 'openai':
      return 'gpt-4.1-mini';
    case 'anthropic':
      return 'claude-3-5-sonnet-latest';
    case 'gemini':
      return 'gemini-2.0-flash';
    default:
      return '';
  }
};
