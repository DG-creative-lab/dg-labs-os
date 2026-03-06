import {
  TERMINAL_LLM_MAX_QUERY_CHARS,
  TERMINAL_LLM_MAX_SESSION_REQUESTS,
  TERMINAL_LLM_TIMEOUT_MS,
} from './terminalLlm';

export type TerminalBrainMode = 'concise' | 'explainer' | 'research';
export type TerminalResponseMode = 'narrative' | 'agent_json';
export type TerminalLlmProvider = 'openrouter' | 'openai' | 'anthropic' | 'gemini';

export type TerminalSettings = {
  brainMode: TerminalBrainMode;
  responseMode: TerminalResponseMode;
  llmProvider: TerminalLlmProvider;
  llmModel: string;
  llmFallbackForUnknown: boolean;
  routerDebug: boolean;
  showLlmSources: boolean;
  strictEvidenceMode: boolean;
  llmTimeoutMs: number;
  llmSessionCap: number;
};

export const TERMINAL_SETTINGS_KEY = 'dg_labs_terminal_settings_v2';

export const defaultTerminalSettings: TerminalSettings = {
  brainMode: 'concise',
  responseMode: 'narrative',
  llmProvider: 'openrouter',
  llmModel: 'openai/gpt-oss-120b',
  llmFallbackForUnknown: true,
  routerDebug: true,
  showLlmSources: true,
  strictEvidenceMode: false,
  llmTimeoutMs: TERMINAL_LLM_TIMEOUT_MS,
  llmSessionCap: TERMINAL_LLM_MAX_SESSION_REQUESTS,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const sanitizeTerminalSettings = (
  partial: Partial<TerminalSettings> | null | undefined
): TerminalSettings => {
  const brainMode =
    partial?.brainMode === 'concise' ||
    partial?.brainMode === 'explainer' ||
    partial?.brainMode === 'research'
      ? partial.brainMode
      : defaultTerminalSettings.brainMode;
  const responseMode =
    partial?.responseMode === 'narrative' || partial?.responseMode === 'agent_json'
      ? partial.responseMode
      : defaultTerminalSettings.responseMode;
  const llmProvider =
    partial?.llmProvider === 'openrouter' ||
    partial?.llmProvider === 'openai' ||
    partial?.llmProvider === 'anthropic' ||
    partial?.llmProvider === 'gemini'
      ? partial.llmProvider
      : defaultTerminalSettings.llmProvider;
  const llmModel =
    typeof partial?.llmModel === 'string' && partial.llmModel.trim().length > 0
      ? partial.llmModel.trim().slice(0, 200)
      : defaultTerminalSettings.llmModel;

  return {
    brainMode,
    responseMode,
    llmProvider,
    llmModel,
    llmFallbackForUnknown:
      typeof partial?.llmFallbackForUnknown === 'boolean'
        ? partial.llmFallbackForUnknown
        : defaultTerminalSettings.llmFallbackForUnknown,
    routerDebug:
      typeof partial?.routerDebug === 'boolean'
        ? partial.routerDebug
        : defaultTerminalSettings.routerDebug,
    showLlmSources:
      typeof partial?.showLlmSources === 'boolean'
        ? partial.showLlmSources
        : defaultTerminalSettings.showLlmSources,
    strictEvidenceMode:
      typeof partial?.strictEvidenceMode === 'boolean'
        ? partial.strictEvidenceMode
        : defaultTerminalSettings.strictEvidenceMode,
    llmTimeoutMs: clamp(
      typeof partial?.llmTimeoutMs === 'number'
        ? partial.llmTimeoutMs
        : defaultTerminalSettings.llmTimeoutMs,
      3000,
      120000
    ),
    llmSessionCap: clamp(
      typeof partial?.llmSessionCap === 'number'
        ? partial.llmSessionCap
        : defaultTerminalSettings.llmSessionCap,
      1,
      100
    ),
  };
};

export const serializeTerminalSettings = (settings: TerminalSettings): string =>
  JSON.stringify(settings);

export const parseTerminalSettings = (raw: string | null): TerminalSettings => {
  if (!raw) return defaultTerminalSettings;
  try {
    const parsed = JSON.parse(raw) as Partial<TerminalSettings>;
    return sanitizeTerminalSettings(parsed);
  } catch {
    return defaultTerminalSettings;
  }
};

export const terminalSettingsSummary = (settings: TerminalSettings): string =>
  [
    `mode=${settings.brainMode}`,
    `response=${settings.responseMode}`,
    `provider=${settings.llmProvider}`,
    `model=${settings.llmModel}`,
    `fallback=${settings.llmFallbackForUnknown ? 'on' : 'off'}`,
    `router-debug=${settings.routerDebug ? 'on' : 'off'}`,
    `llm-sources=${settings.showLlmSources ? 'on' : 'off'}`,
    `strict-evidence=${settings.strictEvidenceMode ? 'on' : 'off'}`,
    `timeout=${Math.round(settings.llmTimeoutMs / 1000)}s`,
    `session-cap=${settings.llmSessionCap}`,
    `query-max=${TERMINAL_LLM_MAX_QUERY_CHARS}`,
  ].join(' | ');
