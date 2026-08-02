import type { VerifySource } from '../utils/apiContracts';
import type { CitationChip, LlmConfidenceLabel } from '../utils/terminalLlm';
import type { TerminalLlmProvider } from '../utils/terminalSettings';

export type TerminalEntry = {
  id: number;
  kind: 'command' | 'output' | 'system';
  text: string;
};

export type LlmHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ToolName =
  | 'profile_context'
  | 'local_context'
  | 'web_verify'
  | 'open_app'
  | 'list_projects'
  | 'retrieve'
  | 'cite';

export type ToolUsage = Record<ToolName, number>;

export type LastWebVerifyContext = {
  query: string;
  summary: string;
  sources: VerifySource[];
};

export type RetrievedHit = {
  id: string;
  source: string;
  title: string;
  snippet: string;
  url?: string;
  score: number;
};

export type RetrieveResult = {
  query: string;
  classification: string;
  hits: RetrievedHit[];
  fromCache: boolean;
};

export type CiteResult = {
  claim: string;
  verdict: string;
  evidence: RetrievedHit[];
  fromCache: boolean;
};

export type EvidenceState = {
  query: string;
  classification: string;
  verdict: string;
  hits: RetrievedHit[];
  fromCache: boolean;
};

export type LastAnswerMeta = {
  confidence: LlmConfidenceLabel;
  chips: CitationChip[];
  unverifiedCount?: number;
};

export type ProviderHealthStatus = 'checking' | 'healthy' | 'missing_key' | 'timeout' | 'error';

export type ProviderHealth = {
  provider: TerminalLlmProvider;
  status: ProviderHealthStatus;
  message: string;
  configured: boolean;
  latencyMs?: number;
};

export type TerminalPanelTab = 'connection' | 'advanced' | 'evidence' | null;

export const INITIAL_TOOL_USAGE: ToolUsage = {
  profile_context: 0,
  local_context: 0,
  web_verify: 0,
  open_app: 0,
  list_projects: 0,
  retrieve: 0,
  cite: 0,
};

export const LLM_COUNT_KEY = 'dg_labs_terminal_llm_count';
export const VERIFY_COUNT_KEY = 'dg_labs_terminal_verify_count';
export const ROUTER_CONFIDENCE_THRESHOLD = 0.8;
export const VERIFY_SESSION_CAP = 12;

export const isRetrievedHit = (value: unknown): value is RetrievedHit =>
  !!value &&
  typeof value === 'object' &&
  typeof (value as { id?: unknown }).id === 'string' &&
  typeof (value as { source?: unknown }).source === 'string' &&
  typeof (value as { title?: unknown }).title === 'string' &&
  typeof (value as { snippet?: unknown }).snippet === 'string' &&
  typeof (value as { score?: unknown }).score === 'number' &&
  (typeof (value as { url?: unknown }).url === 'string' ||
    typeof (value as { url?: unknown }).url === 'undefined');
