import type { NetworkNode } from '../profiles/network';
import type { KnowledgeEntry } from '../knowledge';
import type { WorkbenchItem } from '../profiles/modules';
import type { PublicWritingEntry } from '../profiles/writing/contracts';

export type TerminalKnowledgeContext = {
  user: {
    name: string;
    ownerName?: string;
    aliases?: readonly string[];
    role: string;
    roleFocus: string;
    location: string;
    website: string;
  };
  workbench: readonly WorkbenchItem[];
  writing: readonly PublicWritingEntry[];
  network: readonly NetworkNode[];
  brain?: readonly KnowledgeEntry[];
};

export type KnowledgeSource = 'personal' | 'workbench' | 'writing' | 'network' | 'brain';

export type KnowledgeItem = {
  id: string;
  source: KnowledgeSource;
  title: string;
  snippet: string;
  tags: readonly string[];
  url?: string;
  reviewedClaim?: NonNullable<KnowledgeEntry['reviewedClaim']> & {
    confidence: KnowledgeEntry['confidence'];
  };
};

export type KnowledgeHit = KnowledgeItem & {
  score: number;
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const uniqueTokens = (text: string): string[] => Array.from(new Set(tokenize(text)));

const scoreByTokens = (queryTokens: readonly string[], target: string, weight: number): number => {
  if (queryTokens.length === 0) return 0;
  const haystack = target.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += weight;
  }
  return score;
};

export const buildKnowledgeIndex = (ctx: TerminalKnowledgeContext): KnowledgeItem[] => {
  const identityAliases = [
    ctx.user.name,
    ...(ctx.user.ownerName ? [ctx.user.ownerName] : []),
    ...((ctx.user.aliases ?? []).filter((alias) => alias.trim().length > 0) as string[]),
  ];

  const personalItem: KnowledgeItem = {
    id: 'personal-profile',
    source: 'personal',
    title: `${ctx.user.name} profile`,
    snippet: `${ctx.user.role}. Focus: ${ctx.user.roleFocus}. Location: ${ctx.user.location}. Identity aliases: ${identityAliases.join(', ')}.`,
    tags: ['identity', 'profile', 'focus', 'location', ...identityAliases],
    url: ctx.user.website,
  };

  const workbenchItems: KnowledgeItem[] = ctx.workbench.map((item) => ({
    id: `workbench-${item.id}`,
    source: 'workbench',
    title: item.title,
    snippet: `${item.subtitle}. ${item.summary}`,
    tags: [...item.stack, item.category],
    url: item.links.site ?? item.links.repo ?? item.links.article ?? item.links.demo,
  }));

  const writingItems: KnowledgeItem[] = ctx.writing.map((entry) => ({
    id: `writing-${entry.id}`,
    source: 'writing',
    title: entry.title,
    snippet: `${entry.subtitle}. Reading time: ${entry.readingTime}. Boundary: ${entry.boundary}`,
    tags: entry.topics,
    url: entry.url,
  }));

  const networkItems: KnowledgeItem[] = ctx.network.map((node) => ({
    id: `network-${node.id}`,
    source: 'network',
    title: node.title,
    snippet: `${node.subtitle}${node.period ? ` (${node.period})` : ''}. ${node.bullets.join(' ')}`,
    tags: [node.kind, ...node.tags],
    url: node.links?.url ?? node.links?.repo ?? node.links?.article,
  }));

  const brainItems: KnowledgeItem[] = (ctx.brain ?? []).map((entry) => ({
    id: `brain-${entry.id}`,
    source: 'brain',
    title: entry.title,
    snippet: entry.content.replace(/\s+/g, ' ').trim().slice(0, 280),
    tags: [entry.type, ...entry.tags],
    url: entry.sources[0],
    ...(entry.reviewedClaim && {
      reviewedClaim: { ...entry.reviewedClaim, confidence: entry.confidence },
    }),
  }));

  return [personalItem, ...workbenchItems, ...writingItems, ...networkItems, ...brainItems];
};

export const getKnowledgeSourceStats = (
  ctx: TerminalKnowledgeContext
): Record<KnowledgeSource, number> => ({
  personal: 1,
  workbench: ctx.workbench.length,
  writing: ctx.writing.length,
  network: ctx.network.length,
  brain: (ctx.brain ?? []).length,
});

const scoreKnowledgeItem = (tokens: readonly string[], item: KnowledgeItem): number =>
  scoreByTokens(tokens, item.title, 4) +
  scoreByTokens(tokens, item.tags.join(' '), 3) +
  scoreByTokens(tokens, item.snippet, 2);

const rankKnowledge = (
  queryTokens: readonly string[],
  index: readonly KnowledgeItem[]
): KnowledgeHit[] => {
  const hits: KnowledgeHit[] = [];

  for (const item of index) {
    const score = scoreKnowledgeItem(queryTokens, item);
    if (score > 0) {
      hits.push({ ...item, score });
    }
  }

  return hits.sort((a, b) => b.score - a.score);
};

export const retrieveKnowledge = (
  query: string,
  ctx: TerminalKnowledgeContext,
  topK = 5
): KnowledgeHit[] => rankKnowledge(uniqueTokens(query), buildKnowledgeIndex(ctx)).slice(0, topK);

const normalizeClaim = (claim: string): string =>
  claim
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]$/, '');

export const citeKnowledge = (claim: string, ctx: TerminalKnowledgeContext) => {
  const index = buildKnowledgeIndex(ctx);
  const statement = normalizeClaim(claim);
  const tokens = uniqueTokens(claim);
  // Related text cannot establish support. Match the reviewed claim or an explicit question for it.
  const matches = index.filter(
    (item) =>
      item.reviewedClaim?.confidence === 'verified' &&
      item.url &&
      (normalizeClaim(item.title) === statement ||
        item.reviewedClaim.questions.some((question) => normalizeClaim(question) === statement))
  );
  if (matches.length === 1) {
    const [direct] = matches;
    return {
      verdict: 'supported',
      evidence: [{ ...direct, score: scoreKnowledgeItem(tokens, direct) }],
    } as const;
  }

  const hits = rankKnowledge(tokens, index);
  return {
    verdict: (hits[0]?.score ?? 0) >= 6 ? 'partial' : 'insufficient',
    evidence: hits.slice(0, 5).map((hit) => ({ ...hit, url: undefined })),
  } as const;
};
