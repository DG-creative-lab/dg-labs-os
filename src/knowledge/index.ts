import { parse as parseYaml } from 'yaml';
import type {
  ConfidenceLevel,
  KnowledgeEntry,
  KnowledgeHit,
  KnowledgeType,
  QueryClassification,
} from './schema';

type RawFrontmatter = {
  id: string;
  type: KnowledgeType;
  title: string;
  tags: string[];
  confidence: ConfidenceLevel;
  sources: string[];
  lastVerified: string;
  related: string[];
};

const rawKnowledgeFiles = import.meta.glob('./chunks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const REQUIRED_TYPES: readonly KnowledgeType[] = [
  'identity',
  'experience',
  'project',
  'research',
  'capability',
  'meta',
];

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const uniqueTokens = (text: string): string[] => Array.from(new Set(tokenize(text)));

const estimateTokens = (text: string): number =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).length * 0.75));

const readString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const readStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return null;
  return value.map((item) => item.trim()).filter(Boolean);
};

const parseFrontmatter = (raw: string): { frontmatter: RawFrontmatter; content: string } | null => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const [, block, content] = match;
  let parsedBlock: unknown;
  try {
    parsedBlock = parseYaml(block);
  } catch {
    return null;
  }
  if (!parsedBlock || typeof parsedBlock !== 'object' || Array.isArray(parsedBlock)) return null;

  const record = parsedBlock as Record<string, unknown>;
  const id = readString(record.id);
  const type = readString(record.type);
  const title = readString(record.title);
  const confidence = readString(record.confidence);
  const tags = readStringArray(record.tags);
  const sources = readStringArray(record.sources);
  const related = readStringArray(record.related);
  const lastVerifiedRaw = readString(record.last_verified ?? record.lastVerified);

  if (
    !id ||
    !title ||
    !lastVerifiedRaw ||
    tags === null ||
    sources === null ||
    related === null ||
    !REQUIRED_TYPES.includes(type as KnowledgeType) ||
    !['verified', 'self-reported', 'inferred'].includes(confidence)
  ) {
    return null;
  }

  return {
    frontmatter: {
      id,
      type: type as KnowledgeType,
      title,
      tags,
      confidence: confidence as ConfidenceLevel,
      sources,
      related,
      lastVerified: lastVerifiedRaw,
    },
    content: content.trim(),
  };
};

const buildEntries = (): KnowledgeEntry[] => {
  const entries: KnowledgeEntry[] = [];
  for (const [file, raw] of Object.entries(rawKnowledgeFiles)) {
    const parsed = parseFrontmatter(raw);
    if (!parsed) throw new Error(`Invalid knowledge frontmatter: ${file}`);
    const { frontmatter, content } = parsed;
    entries.push({
      ...frontmatter,
      content,
      tokenEstimate: estimateTokens(content),
      file,
    });
  }
  return entries;
};

const knowledgeEntries = buildEntries();
const knowledgeById = new Map(knowledgeEntries.map((entry) => [entry.id, entry] as const));

export const getKnowledgeEntries = (): readonly KnowledgeEntry[] => knowledgeEntries;

export const getKnowledgeById = (id: string): KnowledgeEntry | undefined => knowledgeById.get(id);

export const getKnowledgeEntryById = (
  entries: readonly KnowledgeEntry[],
  id: string
): KnowledgeEntry | undefined => entries.find((entry) => entry.id === id);

export const searchKnowledgeEntries = (
  entries: readonly KnowledgeEntry[],
  query: string,
  topK = 8
): KnowledgeHit[] => {
  const queryTokens = uniqueTokens(query);
  if (queryTokens.length === 0) return [];

  const hits: KnowledgeHit[] = [];
  for (const entry of entries) {
    const title = entry.title.toLowerCase();
    const tags = entry.tags.join(' ').toLowerCase();
    const body = entry.content.toLowerCase();

    let score = 0;
    for (const token of queryTokens) {
      if (title.includes(token)) score += 5;
      if (tags.includes(token)) score += 3;
      if (body.includes(token)) score += 1;
    }
    if (score > 0) hits.push({ ...entry, score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, topK);
};

export const searchKnowledge = (query: string, topK = 8): KnowledgeHit[] =>
  searchKnowledgeEntries(knowledgeEntries, query, topK);

const CLASSIFICATION_KEYWORDS: Record<QueryClassification, readonly string[]> = {
  identity: ['who', 'about', 'background', 'dessi', 'georgieva', 'yourself', 'profile'],
  project: ['project', 'built', 'build', 'system', 'platform', 'tool', 'framework'],
  research: ['research', 'article', 'deep dive', 'intent', 'phenomenology', 'geometry'],
  capability: ['stack', 'skills', 'language', 'aws', 'python', 'typescript', 'agent architecture'],
  verification: ['verify', 'prove', 'evidence', 'source', 'confirm', 'real'],
  meta: ['how', 'query', 'protocol', 'instructions', 'system prompt'],
  experience: ['experience', 'role', 'work', 'career', 'performics', 'publicis'],
  navigation: ['open', 'show', 'go to', 'navigate', 'app', 'module'],
};

export const classifyKnowledgeQuery = (query: string): QueryClassification => {
  const q = query.toLowerCase();
  let best: QueryClassification = 'identity';
  let bestScore = 0;
  for (const [kind, keywords] of Object.entries(CLASSIFICATION_KEYWORDS) as Array<
    [QueryClassification, readonly string[]]
  >) {
    const score = keywords.reduce((acc, keyword) => (q.includes(keyword) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      best = kind;
    }
  }
  return best;
};

export type { KnowledgeEntry, KnowledgeHit, QueryClassification } from './schema';
