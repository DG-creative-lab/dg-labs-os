import type { NetworkNode } from '../config/network';
import type { WorkbenchItem } from '../config/workbench';
import type { LabNote } from '../config/labNotes';
import type { UserConfig } from '../types';

export type TerminalKnowledgeContext = {
  user: UserConfig;
  workbench: readonly WorkbenchItem[];
  notes: readonly LabNote[];
  network: readonly NetworkNode[];
};

export type KnowledgeSource = 'personal' | 'workbench' | 'notes' | 'network';

export type KnowledgeItem = {
  id: string;
  source: KnowledgeSource;
  title: string;
  snippet: string;
  tags: readonly string[];
  url?: string;
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

  const noteItems: KnowledgeItem[] = ctx.notes.map((note) => ({
    id: `note-${note.id}`,
    source: 'notes',
    title: note.title,
    snippet: `${note.subtitle}. Reading time: ${note.readingTime}.`,
    tags: note.tags,
    url: note.url,
  }));

  const networkItems: KnowledgeItem[] = ctx.network.map((node) => ({
    id: `network-${node.id}`,
    source: 'network',
    title: node.title,
    snippet: `${node.subtitle}${node.period ? ` (${node.period})` : ''}. ${node.bullets.join(' ')}`,
    tags: [node.kind, ...node.tags],
    url: node.links?.url ?? node.links?.repo ?? node.links?.article,
  }));

  return [personalItem, ...workbenchItems, ...noteItems, ...networkItems];
};

export const getKnowledgeSourceStats = (
  ctx: TerminalKnowledgeContext
): Record<KnowledgeSource, number> => ({
  personal: 1,
  workbench: ctx.workbench.length,
  notes: ctx.notes.length,
  network: ctx.network.length,
});

export const retrieveKnowledge = (
  query: string,
  ctx: TerminalKnowledgeContext,
  topK = 5
): KnowledgeHit[] => {
  const q = query.trim();
  if (!q) return [];
  const queryTokens = uniqueTokens(q);
  if (queryTokens.length === 0) return [];

  const index = buildKnowledgeIndex(ctx);
  const hits: KnowledgeHit[] = [];

  for (const item of index) {
    const titleScore = scoreByTokens(queryTokens, item.title, 4);
    const tagScore = scoreByTokens(queryTokens, item.tags.join(' '), 3);
    const snippetScore = scoreByTokens(queryTokens, item.snippet, 2);
    const score = titleScore + tagScore + snippetScore;
    if (score > 0) {
      hits.push({ ...item, score });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, topK);
};
