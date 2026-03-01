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

const parsePrimitive = (raw: string): string | string[] => {
  const value = raw.trim();
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === 'string' ? item : String(item)))
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      return [];
    }
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

const parseFrontmatter = (raw: string): { frontmatter: RawFrontmatter; content: string } | null => {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;
  const [, block, content] = match;
  const rowEntries = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf(':');
      if (separator < 1) return null;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      return [key, parsePrimitive(value)] as const;
    })
    .filter((entry): entry is readonly [string, string | string[]] => entry !== null);

  const record = Object.fromEntries(rowEntries) as Record<string, string | string[]>;
  const id = typeof record.id === 'string' ? record.id : '';
  const type = typeof record.type === 'string' ? record.type : '';
  const title = typeof record.title === 'string' ? record.title : '';
  const confidence = typeof record.confidence === 'string' ? record.confidence : '';
  const tags = Array.isArray(record.tags) ? record.tags : [];
  const sources = Array.isArray(record.sources) ? record.sources : [];
  const related = Array.isArray(record.related) ? record.related : [];
  const lastVerifiedRaw =
    typeof record.last_verified === 'string'
      ? record.last_verified
      : typeof record.lastVerified === 'string'
        ? record.lastVerified
        : '';

  if (
    !id ||
    !title ||
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
      lastVerified: lastVerifiedRaw || new Date().toISOString().slice(0, 10),
    },
    content: content.trim(),
  };
};

const buildEntries = (): KnowledgeEntry[] => {
  const entries: KnowledgeEntry[] = [];
  for (const [file, raw] of Object.entries(rawKnowledgeFiles)) {
    const parsed = parseFrontmatter(raw);
    if (!parsed) continue;
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

export const searchKnowledge = (query: string, topK = 8): KnowledgeHit[] => {
  const queryTokens = uniqueTokens(query);
  if (queryTokens.length === 0) return [];

  const hits: KnowledgeHit[] = [];
  for (const entry of knowledgeEntries) {
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
