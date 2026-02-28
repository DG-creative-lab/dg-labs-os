import type { NetworkNode } from '../config/network';
import type { WorkbenchItem } from '../config/workbench';
import type { LabNote } from '../config/labNotes';
import type { UserConfig } from '../types';
import type { KnowledgeHit } from './terminalKnowledge';

export const TERMINAL_LLM_MAX_QUERY_CHARS = 900;
export const TERMINAL_LLM_TIMEOUT_MS = 15000;
export const TERMINAL_LLM_MAX_SESSION_REQUESTS = 24;
export const TERMINAL_LLM_MAX_TURNS = 10;

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

export const buildTerminalSystemContext = (ctx: TerminalContextShape): string => {
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
    'Speak concisely and practically.',
    'Use only provided context for personal/work claims; if unknown, say so.',
    'If a question needs external verification, state that web search/tooling is not enabled in this runtime.',
    '',
    `Identity: ${ctx.user.name} | role: ${ctx.user.role} | focus: ${ctx.user.roleFocus}`,
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
  grounding: readonly KnowledgeHit[] = []
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> => {
  const groundingBlock =
    grounding.length === 0
      ? ''
      : [
          '',
          'Grounded context snippets (local index):',
          ...grounding.map(
            (item, index) =>
              `${index + 1}. [${item.source}] ${item.title} :: ${item.snippet}${item.url ? ` (source: ${item.url})` : ''}`
          ),
        ].join('\n');

  const system = `${buildTerminalSystemContext(ctx)}${groundingBlock}`;
  const compactHistory = priorHistory.slice(-TERMINAL_LLM_MAX_TURNS * 2);
  return [{ role: 'system', content: system }, ...compactHistory, { role: 'user', content: query }];
};

export const readChatMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  return null;
};
