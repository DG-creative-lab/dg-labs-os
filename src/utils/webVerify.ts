import type { VerifySource } from './apiContracts';

type DuckDuckGoTopic = {
  Text?: string;
  FirstURL?: string;
  Topics?: DuckDuckGoTopic[];
};

type DuckDuckGoResponse = {
  AbstractText?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: DuckDuckGoTopic[];
};

type FootprintSource = {
  title: string;
  url: string;
  tags: readonly string[];
};

const DG_LABS_FOOTPRINT: readonly FootprintSource[] = [
  {
    title: 'Dessi Georgieva (LinkedIn)',
    url: 'https://www.linkedin.com/in/dessi-georgieva-997a8732/',
    tags: ['linkedin', 'experience', 'education', 'profile'],
  },
  {
    title: 'DG-creative-lab (GitHub)',
    url: 'https://github.com/DG-creative-lab',
    tags: ['github', 'projects', 'repositories', 'portfolio'],
  },
  {
    title: 'ai-knowledge-hub (GitHub org)',
    url: 'https://github.com/ai-knowledge-hub',
    tags: ['github', 'org', 'research', 'projects'],
  },
  {
    title: 'AI News Hub (Performics Labs)',
    url: 'https://ai-news-hub.performics-labs.com/',
    tags: ['articles', 'research', 'writing'],
  },
  {
    title: 'AI Skills Platform',
    url: 'https://skills.ai-knowledge-hub.org/',
    tags: ['skills', 'agents', 'tooling'],
  },
];

const flattenTopics = (topics: DuckDuckGoTopic[] | undefined): DuckDuckGoTopic[] => {
  if (!topics) return [];
  const out: DuckDuckGoTopic[] = [];
  for (const topic of topics) {
    if (Array.isArray(topic.Topics)) out.push(...flattenTopics(topic.Topics));
    else out.push(topic);
  }
  return out;
};

const parseHostname = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const extractPageSnippet = (html: string): { title: string; snippet: string } => {
  const pageTitle =
    html
      .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/\s+/g, ' ')
      .trim() ?? '';
  const metaDescription =
    html
      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
      ?.replace(/\s+/g, ' ')
      .trim() ?? '';
  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    title: pageTitle,
    snippet: (metaDescription || plain || 'No summary available from source page.').slice(0, 280),
  };
};

const isIdentityVerificationQuery = (query: string): boolean => {
  const q = query.toLowerCase();
  return (
    q.includes('dessi') ||
    q.includes('georgieva') ||
    q.includes('dg-labs') ||
    q.includes('linkedin') ||
    q.includes('ai-knowledge-hub') ||
    q.includes('dg-creative-lab')
  );
};

const buildIdentitySourcePlan = (query: string): FootprintSource[] => {
  const q = query.toLowerCase();
  const ranked = DG_LABS_FOOTPRINT.map((source) => {
    const score = source.tags.reduce((acc, tag) => (q.includes(tag) ? acc + 2 : acc), 0);
    return { source, score };
  }).sort((a, b) => b.score - a.score);

  const selected = ranked
    .filter((item) => item.score > 0)
    .map((item) => item.source)
    .slice(0, 4);

  return selected.length > 0 ? selected : DG_LABS_FOOTPRINT.slice(0, 4);
};

const fetchSourceEvidence = async (
  source: FootprintSource,
  timeoutMs: number
): Promise<VerifySource | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.url, {
      method: 'GET',
      headers: { Accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
    });
    if (!response.ok) {
      return null;
    }
    const raw = (await response.text()).slice(0, 200_000);
    const parsed = extractPageSnippet(raw);
    return {
      title: parsed.title || source.title,
      url: source.url,
      snippet: parsed.snippet,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const fetchDuckDuckGoSources = async (
  query: string,
  timeoutMs: number
): Promise<VerifySource[]> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url = new URL('https://api.duckduckgo.com/');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('no_html', '1');
    url.searchParams.set('skip_disambig', '1');
    url.searchParams.set('no_redirect', '1');

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error('UPSTREAM_ERROR');
    }

    const payload = (await response.json()) as DuckDuckGoResponse;
    const sources: VerifySource[] = [];
    if (payload.AbstractText && payload.AbstractURL) {
      sources.push({
        title: payload.Heading?.trim() || 'Abstract',
        url: payload.AbstractURL,
        snippet: payload.AbstractText.trim().slice(0, 260),
      });
    }
    const related = flattenTopics(payload.RelatedTopics).filter(
      (topic) =>
        typeof topic.Text === 'string' &&
        topic.Text.trim().length > 0 &&
        typeof topic.FirstURL === 'string' &&
        topic.FirstURL.trim().length > 0
    );
    for (const topic of related.slice(0, 5)) {
      sources.push({
        title: topic.Text!.split(' - ')[0].trim(),
        url: topic.FirstURL!,
        snippet: topic.Text!.trim().slice(0, 260),
      });
    }
    return sources;
  } finally {
    clearTimeout(timeout);
  }
};

const summarizeFromSources = (query: string, sources: VerifySource[]): string => {
  if (sources.length === 0) {
    return `No high-confidence web matches were found for "${query}". Refine the query and retry verify.`;
  }
  const domains = Array.from(new Set(sources.map((source) => parseHostname(source.url)))).slice(
    0,
    4
  );
  return `Found ${sources.length} web source${sources.length > 1 ? 's' : ''} for "${query}" across ${domains.join(', ')}.`;
};

export const performWebVerify = async (
  query: string,
  timeoutMs = 8000
): Promise<{ summary: string; sources: VerifySource[] }> => {
  const searchSources = await fetchDuckDuckGoSources(query, timeoutMs);
  let sources = searchSources;

  if (isIdentityVerificationQuery(query)) {
    const plan = buildIdentitySourcePlan(query);
    const evidence = await Promise.all(plan.map((item) => fetchSourceEvidence(item, timeoutMs)));
    sources = [...sources, ...evidence.filter((item): item is VerifySource => item !== null)];
  }

  const unique = Array.from(new Map(sources.map((source) => [source.url, source])).values()).slice(
    0,
    8
  );
  return { summary: summarizeFromSources(query, unique), sources: unique };
};
