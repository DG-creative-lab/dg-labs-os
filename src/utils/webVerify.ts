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

const flattenTopics = (topics: DuckDuckGoTopic[] | undefined): DuckDuckGoTopic[] => {
  if (!topics) return [];
  const out: DuckDuckGoTopic[] = [];
  for (const topic of topics) {
    if (Array.isArray(topic.Topics)) out.push(...flattenTopics(topic.Topics));
    else out.push(topic);
  }
  return out;
};

const summarizeFromSources = (query: string, sources: VerifySource[]): string => {
  if (sources.length === 0) {
    return `No high-confidence web matches were found for "${query}". Refine the query and retry verify.`;
  }
  return `Found ${sources.length} web source${sources.length > 1 ? 's' : ''} for "${query}". Review citations below.`;
};

export const performWebVerify = async (
  query: string,
  timeoutMs = 8000
): Promise<{ summary: string; sources: VerifySource[] }> => {
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

    const unique = Array.from(
      new Map(sources.map((source) => [source.url, source])).values()
    ).slice(0, 5);
    return { summary: summarizeFromSources(query, unique), sources: unique };
  } finally {
    clearTimeout(timeout);
  }
};
