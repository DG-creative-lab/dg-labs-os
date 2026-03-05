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

export type LlmAnswerMode = 'ask' | 'brief' | 'cv' | 'projects';
export type LlmConfidenceLabel =
  | 'local-only'
  | 'local+verified'
  | 'verified-only'
  | 'low-confidence';

export type CitationChipGroup = 'Profile' | 'Projects' | 'Research' | 'Web';

export type CitationChip = {
  group: CitationChipGroup;
  label: string;
  url: string;
};

export type CitationChipGroupBucket = {
  group: CitationChipGroup;
  chips: CitationChip[];
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
  if (/^(ask|brief|cv)\s+/i.test(trimmed)) return true;
  if (/^projects\s+/i.test(trimmed)) return true;
  return !isDeterministicCommand;
};

export const normalizeLlmQuery = (rawInput: string): string =>
  rawInput
    .replace(/^ask\s+/i, '')
    .trim()
    .slice(0, TERMINAL_LLM_MAX_QUERY_CHARS);

export const parseLlmModeQuery = (rawInput: string): { mode: LlmAnswerMode; query: string } => {
  const trimmed = rawInput.trim();
  if (!trimmed) return { mode: 'ask', query: '' };

  const capture = (mode: LlmAnswerMode, expr: RegExp) => {
    const match = trimmed.match(expr);
    if (!match) return null;
    const query = (match[1] ?? '').trim().slice(0, TERMINAL_LLM_MAX_QUERY_CHARS);
    return { mode, query };
  };

  return (
    capture('ask', /^ask\s+(.+)$/i) ??
    capture('brief', /^brief\s+(.+)$/i) ??
    capture('cv', /^cv\s+(.+)$/i) ??
    capture('projects', /^projects\s+(.+)$/i) ?? { mode: 'ask', query: normalizeLlmQuery(trimmed) }
  );
};

const answerModeInstructions = (mode: LlmAnswerMode): string[] => {
  if (mode === 'brief') {
    return ['Answer style: brief.', 'Use compact bullets (3-6) and avoid long prose.'];
  }
  if (mode === 'cv') {
    return [
      'Answer style: cv.',
      'Prioritize experience timeline, roles, and measurable delivery before theory.',
    ];
  }
  if (mode === 'projects') {
    return [
      'Answer style: projects.',
      'Prioritize builds, architecture, stack, outcomes, and direct links if available.',
    ];
  }
  return ['Answer style: ask.', 'Use narrative answer with clear sections when helpful.'];
};

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
  mode: TerminalBrainMode = 'concise',
  answerMode: LlmAnswerMode = 'ask'
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> => {
  const baseSystem = buildTerminalSystemContext(ctx, mode);
  const systemLines = [baseSystem, '', ...answerModeInstructions(answerMode)];
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

export const resolveAnswerConfidenceLabel = (
  localEvidenceCount: number,
  verifiedWebSourceCount: number
): LlmConfidenceLabel => {
  if (localEvidenceCount > 0 && verifiedWebSourceCount > 0) return 'local+verified';
  if (localEvidenceCount > 0) return 'local-only';
  if (verifiedWebSourceCount > 0) return 'verified-only';
  return 'low-confidence';
};

const sourceToGroup = (source: string): CitationChipGroup => {
  const key = source.toLowerCase();
  if (key === 'workbench') return 'Projects';
  if (key === 'notes' || key === 'brain') return 'Research';
  if (key === 'personal' || key === 'network') return 'Profile';
  return 'Research';
};

export const buildCitationChips = (
  localEvidence: readonly EvidenceReference[],
  webSources: readonly VerifySource[] = []
): CitationChip[] => {
  const chips: CitationChip[] = [];
  const seen = new Set<string>();

  const push = (chip: CitationChip) => {
    const key = `${chip.group}|${chip.label}|${chip.url}`;
    if (seen.has(key)) return;
    seen.add(key);
    chips.push(chip);
  };

  for (const evidence of localEvidence) {
    if (!evidence.url) continue;
    push({
      group: sourceToGroup(evidence.source),
      label: evidence.title,
      url: evidence.url,
    });
  }

  for (const source of webSources) {
    push({
      group: 'Web',
      label: source.title,
      url: source.url,
    });
  }

  return chips;
};

const CITATION_GROUP_ORDER: CitationChipGroup[] = ['Profile', 'Projects', 'Research', 'Web'];

export const groupCitationChips = (chips: readonly CitationChip[]): CitationChipGroupBucket[] => {
  const grouped = new Map<CitationChipGroup, CitationChip[]>();
  for (const chip of chips) {
    const bucket = grouped.get(chip.group) ?? [];
    bucket.push(chip);
    grouped.set(chip.group, bucket);
  }

  return CITATION_GROUP_ORDER.map((group) => ({
    group,
    chips: grouped.get(group) ?? [],
  })).filter((bucket) => bucket.chips.length > 0);
};

export const explainConfidenceLabel = (label: LlmConfidenceLabel): string => {
  if (label === 'local+verified') {
    return 'Trust level: local evidence corroborated by web verification.';
  }
  if (label === 'local-only') {
    return 'Trust level: grounded in local DG-Labs knowledge; run verify for web corroboration.';
  }
  if (label === 'verified-only') {
    return 'Trust level: web-verified sources present; local index support was limited.';
  }
  return 'Trust level: low evidence. Refine query or run verify/context before relying on this answer.';
};

export const confidenceBadgeText = (label: LlmConfidenceLabel): string => {
  if (label === 'local+verified') return 'corroborated';
  if (label === 'local-only') return 'local only';
  if (label === 'verified-only') return 'verified only';
  return 'low confidence';
};

export const explainVerificationGap = (
  verifiedWebSourceCount: number,
  query: string
): string | null => {
  if (verifiedWebSourceCount > 0) return null;
  const safeQuery = query.trim() || 'your query';
  return `Verification gap: no corroborating web sources were found for "${safeQuery}". Refine the query or verify a specific profile/project link.`;
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

export type EvidenceReference = {
  source: string;
  title: string;
  snippet: string;
  url?: string;
  score: number;
};

export type CitationFormatResult = {
  answer: string;
  citationLines: string[];
  unverifiedCount: number;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const sentenceTokens = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

const evidenceTokens = (value: EvidenceReference): Set<string> =>
  new Set(sentenceTokens(`${value.title} ${value.snippet}`));

const bestEvidenceIndex = (
  sentence: string,
  evidences: readonly EvidenceReference[]
): number | null => {
  const st = sentenceTokens(sentence);
  if (st.length === 0 || evidences.length === 0) return null;
  let bestIndex: number | null = null;
  let bestScore = 0;
  for (const [index, evidence] of evidences.entries()) {
    const et = evidenceTokens(evidence);
    let score = 0;
    for (const token of st) {
      if (et.has(token)) score += 1;
    }
    score += Math.max(0, Math.min(3, evidence.score / 8));
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }
  return bestScore > 0 ? bestIndex : null;
};

export const formatAnswerWithCitations = (
  answer: string,
  evidences: readonly EvidenceReference[],
  strictEvidenceMode = false
): CitationFormatResult => {
  const segments = answer
    .split(/(?<=[.!?])\s+|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return { answer, citationLines: [], unverifiedCount: 0 };
  }

  const evidenceToCitation = new Map<number, number>();
  const citationOrder: number[] = [];
  let nextCitation = 1;
  let unverifiedCount = 0;

  const outSegments = segments.map((segment) => {
    const evidenceIndex = bestEvidenceIndex(segment, evidences);
    if (evidenceIndex === null) {
      unverifiedCount += 1;
      if (strictEvidenceMode) {
        return '[insufficient evidence]';
      }
      return `${segment} [unverified]`;
    }
    let citation = evidenceToCitation.get(evidenceIndex);
    if (!citation) {
      citation = nextCitation++;
      evidenceToCitation.set(evidenceIndex, citation);
      citationOrder.push(evidenceIndex);
    }
    return `${segment} [${citation}]`;
  });

  const citationLines = citationOrder.map((evidenceIndex) => {
    const citation = evidenceToCitation.get(evidenceIndex)!;
    const evidence = evidences[evidenceIndex];
    const tail = evidence.url ? ` — ${evidence.url}` : '';
    return `[${citation}] ${evidence.title}${tail}`;
  });

  if (strictEvidenceMode && outSegments.every((segment) => segment === '[insufficient evidence]')) {
    return {
      answer:
        'Insufficient evidence for this query in the current DG-Labs knowledge context. Try refine, retrieve, or verify.',
      citationLines,
      unverifiedCount,
    };
  }

  return {
    answer: outSegments.join(' '),
    citationLines,
    unverifiedCount,
  };
};

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
