import type { VerifySource } from './apiContracts';

export const TERMINAL_LLM_MAX_QUERY_CHARS = 900;
export const TERMINAL_LLM_TIMEOUT_MS = 45000;
export const TERMINAL_LLM_MAX_SESSION_REQUESTS = 24;

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

export const isLlmQuery = (rawInput: string, isDeterministicCommand: boolean): boolean => {
  const trimmed = rawInput.trim();
  if (!trimmed) return false;
  if (/^(ask|brief|cv)\s*:?\s+/i.test(trimmed)) return true;
  if (/^projects\s*:?\s+/i.test(trimmed)) return true;
  return !isDeterministicCommand;
};

export const normalizeLlmQuery = (rawInput: string): string =>
  rawInput
    .replace(/^ask\s*:?\s+/i, '')
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
    capture('ask', /^ask\s*:?\s+(.+)$/i) ??
    capture('brief', /^brief\s*:?\s+(.+)$/i) ??
    capture('cv', /^cv\s*:?\s+(.+)$/i) ??
    capture('projects', /^projects\s*:?\s+(.+)$/i) ?? {
      mode: 'ask',
      query: normalizeLlmQuery(trimmed),
    }
  );
};

export const normalizeTerminalNarrativeAnswer = (value: string): string =>
  value
    .replace(/[\u2014\u2013\u2011]/g, '-')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/\r/g, '')
    .trim();

export const readChatMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (typeof record.message === 'string') return record.message;
  return null;
};

export type ChatResponseMeta = {
  provider: string;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  fallbackFrom?: string;
};

export const readChatMeta = (data: unknown): ChatResponseMeta | null => {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const meta = record.meta;
  if (!meta || typeof meta !== 'object') return null;
  const metaRecord = meta as Record<string, unknown>;
  if (
    typeof metaRecord.provider !== 'string' ||
    typeof metaRecord.model !== 'string' ||
    typeof metaRecord.latencyMs !== 'number' ||
    typeof metaRecord.fallbackUsed !== 'boolean'
  ) {
    return null;
  }
  return {
    provider: metaRecord.provider,
    model: metaRecord.model,
    latencyMs: metaRecord.latencyMs,
    fallbackUsed: metaRecord.fallbackUsed,
    fallbackFrom: typeof metaRecord.fallbackFrom === 'string' ? metaRecord.fallbackFrom : undefined,
  };
};

export type ChatErrorMeta = {
  provider?: string;
  hint?: string;
  errorClass?: string;
  fallbackAvailable?: boolean;
};

export type JsonSseEvent = {
  event: string;
  payload: unknown;
};

export const readChatErrorMeta = (data: unknown): ChatErrorMeta | null => {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  const meta = record.meta;
  if (!meta || typeof meta !== 'object') return null;
  const metaRecord = meta as Record<string, unknown>;
  return {
    provider: typeof metaRecord.provider === 'string' ? metaRecord.provider : undefined,
    hint: typeof metaRecord.hint === 'string' ? metaRecord.hint : undefined,
    errorClass: typeof metaRecord.errorClass === 'string' ? metaRecord.errorClass : undefined,
    fallbackAvailable:
      typeof metaRecord.fallbackAvailable === 'boolean' ? metaRecord.fallbackAvailable : undefined,
  };
};

const parseSseBlock = (block: string): JsonSseEvent | null => {
  const trimmed = block.trim();
  if (!trimmed) return null;

  let event = 'message';
  const dataLines: string[] = [];

  for (const rawLine of trimmed.split('\n')) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) {
      event = line.slice(6).trim() || 'message';
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) return null;
  const rawData = dataLines.join('\n');

  try {
    return { event, payload: JSON.parse(rawData) as unknown };
  } catch {
    return { event, payload: rawData };
  }
};

export const consumeJsonSseStream = async (
  response: Response,
  onEvent: (event: JsonSseEvent) => void | Promise<void>
) => {
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
      const parsed = parseSseBlock(block);
      if (parsed) {
        await onEvent(parsed);
      }
      boundaryIndex = buffer.indexOf('\n\n');
    }

    if (done) break;
  }

  const finalBlock = parseSseBlock(buffer);
  if (finalBlock) {
    await onEvent(finalBlock);
  }
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
    const tail = evidence.url ? ` - ${evidence.url}` : '';
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
