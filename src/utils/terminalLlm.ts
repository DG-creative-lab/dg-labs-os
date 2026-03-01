import type { NetworkNode } from '../config/network';
import type { WorkbenchItem } from '../config/workbench';
import type { LabNote } from '../config/labNotes';
import type { UserConfig } from '../types';
import type { KnowledgeHit } from './terminalKnowledge';
import type { TerminalBrainMode } from './terminalSettings';
import type { VerifySource } from './apiContracts';

export const TERMINAL_LLM_MAX_QUERY_CHARS = 900;
export const TERMINAL_LLM_TIMEOUT_MS = 45000;
export const TERMINAL_LLM_MAX_SESSION_REQUESTS = 24;
export const TERMINAL_LLM_MAX_TURNS = 6;
export const TERMINAL_LLM_SYSTEM_CHAR_BUDGET = 5200;
export const TERMINAL_LLM_HISTORY_CHAR_BUDGET = 1600;
export const TERMINAL_LLM_GROUNDING_MAX_ITEMS = 6;
export const TERMINAL_LLM_WEB_SOURCES_MAX_ITEMS = 3;

type TerminalContextShape = {
  user: UserConfig;
  workbench: readonly WorkbenchItem[];
  notes: readonly LabNote[];
  network: readonly NetworkNode[];
};

type LlmHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type WebVerifyContext = {
  query: string;
  summary: string;
  sources: readonly VerifySource[];
};

const truncate = (value: string, maxChars: number): string =>
  value.length <= maxChars ? value : `${value.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;

const pushWithinBudget = (lines: string[], next: string, maxChars: number): boolean => {
  const current = lines.join('\n').length;
  const nextLen = next.length + (lines.length > 0 ? 1 : 0);
  if (current + nextLen > maxChars) return false;
  lines.push(next);
  return true;
};

const buildBudgetedGroundingLines = (
  grounding: readonly KnowledgeHit[],
  maxChars: number
): string[] => {
  if (grounding.length === 0) return [];
  const lines: string[] = ['', 'Grounded context snippets (local index):'];
  const sorted = [...grounding]
    .sort((a, b) => b.score - a.score)
    .slice(0, TERMINAL_LLM_GROUNDING_MAX_ITEMS);

  for (const [index, item] of sorted.entries()) {
    const sourceSuffix = item.url ? ` (source: ${item.url})` : '';
    const line = `${index + 1}. [${item.source}] ${item.title} :: ${truncate(item.snippet, 180)}${sourceSuffix}`;
    if (!pushWithinBudget(lines, line, maxChars)) break;
  }

  return lines.length > 2 ? lines : [];
};

const buildBudgetedWebContextLines = (
  webContext: WebVerifyContext | null,
  maxChars: number
): string[] => {
  if (!webContext || webContext.sources.length === 0) return [];
  const lines: string[] = [
    '',
    'Latest web verification context:',
    `query: ${truncate(webContext.query, 180)}`,
    `summary: ${truncate(webContext.summary, 260)}`,
  ];

  const sources = webContext.sources.slice(0, TERMINAL_LLM_WEB_SOURCES_MAX_ITEMS);
  for (const [index, source] of sources.entries()) {
    const line = `${index + 1}. ${source.title} :: ${truncate(source.snippet, 140)} (source: ${source.url})`;
    if (!pushWithinBudget(lines, line, maxChars)) break;
  }
  return lines;
};

const selectBudgetedHistory = (
  priorHistory: readonly LlmHistoryMessage[],
  maxTurns: number,
  maxChars: number
): LlmHistoryMessage[] => {
  const maxItems = maxTurns * 2;
  const selected: LlmHistoryMessage[] = [];
  let usedChars = 0;

  for (let i = priorHistory.length - 1; i >= 0 && selected.length < maxItems; i -= 1) {
    const item = priorHistory[i];
    const content = truncate(item.content, 240);
    const cost = content.length;
    if (usedChars + cost > maxChars) continue;
    selected.push({ role: item.role, content });
    usedChars += cost;
  }

  return selected.reverse();
};

export const isLlmQuery = (rawInput: string, isDeterministicCommand: boolean): boolean => {
  const trimmed = rawInput.trim();
  if (!trimmed) return false;
  if (/^ask\s+/i.test(trimmed)) return true;
  return !isDeterministicCommand;
};

export const normalizeLlmQuery = (rawInput: string): string =>
  rawInput
    .replace(/^ask\s+/i, '')
    .trim()
    .slice(0, TERMINAL_LLM_MAX_QUERY_CHARS);

const modeInstructions = (mode: TerminalBrainMode): string[] => {
  if (mode === 'explainer') {
    return [
      'Response mode: explainer.',
      'Use short sections and concrete examples. Prioritize clarity over brevity.',
    ];
  }
  if (mode === 'research') {
    return [
      'Response mode: research.',
      'State assumptions, separate evidence from inference, and mention uncertainty.',
    ];
  }
  return [
    'Response mode: concise.',
    'Answer in compact operational form (2-6 lines unless asked otherwise).',
  ];
};

export const buildTerminalSystemContext = (
  ctx: TerminalContextShape,
  mode: TerminalBrainMode = 'concise'
): string => {
  const topProjects = ctx.workbench.slice(0, 4).map((p) => `- ${p.title}: ${p.summary}`);
  const topNotes = ctx.notes
    .filter((n) => n.kind === 'Deep Dive')
    .slice(0, 4)
    .map((n) => `- ${n.title}: ${n.subtitle}`);
  const networkStats = [
    `nodes=${ctx.network.length}`,
    `projects=${ctx.network.filter((n) => n.kind === 'Project').length}`,
    `research=${ctx.network.filter((n) => n.kind === 'Research').length}`,
    `experience=${ctx.network.filter((n) => n.kind === 'Experience').length}`,
  ].join(', ');

  return [
    'You are the DG-Labs OS terminal brain.',
    'Identity contract: DG-Labs OS is the cognitive interface of Dessi Georgieva.',
    'Treat references to "DG-Labs", "Dessi", and "Dessi Georgieva" as the same person/system.',
    'Speak concisely and practically.',
    'Use only provided context for personal/work claims; if unknown, say so.',
    'If a question needs external verification, state that web search/tooling is not enabled in this runtime.',
    ...modeInstructions(mode),
    '',
    `Identity: ${ctx.user.name}${ctx.user.ownerName ? ` (owner: ${ctx.user.ownerName})` : ''} | role: ${ctx.user.role} | focus: ${ctx.user.roleFocus}`,
    `Aliases: ${(ctx.user.aliases ?? [ctx.user.name]).join(', ')}`,
    `Location: ${ctx.user.location}`,
    '',
    'Top workbench systems:',
    ...topProjects,
    '',
    'Top deep dives:',
    ...topNotes,
    '',
    `Network stats: ${networkStats}`,
  ].join('\n');
};

export const buildLlmMessages = (
  query: string,
  ctx: TerminalContextShape,
  priorHistory: readonly LlmHistoryMessage[],
  grounding: readonly KnowledgeHit[] = [],
  webContext: WebVerifyContext | null = null,
  mode: TerminalBrainMode = 'concise'
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> => {
  const baseSystem = buildTerminalSystemContext(ctx, mode);
  const systemLines = [baseSystem];
  let budgetUsed = baseSystem.length;

  const groundingLines = buildBudgetedGroundingLines(
    grounding,
    Math.max(0, TERMINAL_LLM_SYSTEM_CHAR_BUDGET - budgetUsed)
  );
  if (groundingLines.length > 0) {
    systemLines.push(groundingLines.join('\n'));
    budgetUsed += groundingLines.join('\n').length;
  }

  const webLines = buildBudgetedWebContextLines(
    webContext,
    Math.max(0, TERMINAL_LLM_SYSTEM_CHAR_BUDGET - budgetUsed)
  );
  if (webLines.length > 0) {
    systemLines.push(webLines.join('\n'));
  }

  const compactHistory = selectBudgetedHistory(
    priorHistory,
    TERMINAL_LLM_MAX_TURNS,
    TERMINAL_LLM_HISTORY_CHAR_BUDGET
  );

  return [
    { role: 'system', content: systemLines.join('\n') },
    ...compactHistory,
    { role: 'user', content: truncate(query, TERMINAL_LLM_MAX_QUERY_CHARS) },
  ];
};

export const readChatMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  return null;
};

type AgentChunk = {
  id: string;
  type: string;
  title: string;
  confidence: string;
  score: number;
  sources: string[];
  related: string[];
};

export type AgentJsonPayload = {
  query: string;
  classification: string;
  chunks: AgentChunk[];
  sources: string[];
  suggestedFollowUp: string[];
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const readAgentJsonPayload = (data: unknown): AgentJsonPayload | null => {
  const root = asRecord(data);
  if (!root || root.mode !== 'agent_json') return null;
  const payload = asRecord(root.data);
  if (!payload) return null;
  const query = typeof payload.query === 'string' ? payload.query : '';
  const classification = typeof payload.classification === 'string' ? payload.classification : '';
  const chunksRaw = Array.isArray(payload.chunks) ? payload.chunks : [];
  const chunks = chunksRaw
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const id = typeof row.id === 'string' ? row.id : '';
      const type = typeof row.type === 'string' ? row.type : '';
      const title = typeof row.title === 'string' ? row.title : '';
      const confidence = typeof row.confidence === 'string' ? row.confidence : '';
      const score = typeof row.score === 'number' ? row.score : 0;
      const sources = Array.isArray(row.sources)
        ? row.sources.filter((source): source is string => typeof source === 'string')
        : [];
      const related = Array.isArray(row.related)
        ? row.related.filter((value): value is string => typeof value === 'string')
        : [];
      if (!id || !type || !title) return null;
      return { id, type, title, confidence, score, sources, related };
    })
    .filter((chunk): chunk is AgentChunk => chunk !== null);
  const sources = Array.isArray(payload.sources)
    ? payload.sources.filter((source): source is string => typeof source === 'string')
    : [];
  const suggestedFollowUp = Array.isArray(payload.suggestedFollowUp)
    ? payload.suggestedFollowUp.filter((item): item is string => typeof item === 'string')
    : [];
  return { query, classification, chunks, sources, suggestedFollowUp };
};

export const buildAgentJsonLines = (payload: AgentJsonPayload): string[] => {
  const lines: string[] = [
    '[agent_json]',
    `- query: ${payload.query || 'n/a'}`,
    `- classification: ${payload.classification || 'general'}`,
    `- chunks: ${payload.chunks.length}`,
  ];

  for (const [index, chunk] of payload.chunks.slice(0, 6).entries()) {
    const sourceLabel = chunk.sources.slice(0, 2).join(', ') || 'n/a';
    lines.push(`${index + 1}. [${chunk.type}] ${chunk.title} (score=${chunk.score})`);
    lines.push(`   confidence=${chunk.confidence || 'n/a'} | sources=${sourceLabel}`);
  }

  if (payload.suggestedFollowUp.length > 0) {
    lines.push('[suggested_follow_up]');
    for (const followUp of payload.suggestedFollowUp.slice(0, 3)) {
      lines.push(`- ${followUp}`);
    }
  }

  return lines;
};
