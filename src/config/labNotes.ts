export type LabNote = {
  id: string;
  kind: 'Deep Dive' | 'News' | 'Essay';
  title: string;
  subtitle: string;
  readingTime: string;
  url: string;
  tags: readonly string[];
};

export const labNotes: readonly LabNote[] = [
  {
    id: 'empowerment-imperative',
    kind: 'Deep Dive',
    title: 'The Empowerment Imperative',
    subtitle: 'Rewriting agentic marketing from extraction to human flourishing',
    readingTime: '18 min',
    url: 'https://ai-news-hub.performics-labs.com/analysis/empowerment-imperative-agentic-marketing-human-flourishing',
    tags: ['agency', 'ethics', 'systems', 'architecture'],
  },
  {
    id: 'geometry-of-intention',
    kind: 'Deep Dive',
    title: 'The Geometry of Intention',
    subtitle: 'How LLMs predict human goals in marketing contexts',
    readingTime: '25 min',
    url: 'https://ai-news-hub.performics-labs.com/analysis/geometry-of-intention-llms-human-goals-marketing',
    tags: ['intent', 'representation', 'evaluation', 'embeddings'],
  },
  {
    id: 'memory-and-agency',
    kind: 'Deep Dive',
    title: 'Memory and Agency',
    subtitle: 'How to build an LLM agent that remembers',
    readingTime: '25 min',
    url: 'https://ai-news-hub.performics-labs.com/analysis/memory-agency-llm-seo-agent-learns-over-time',
    tags: ['memory', 'agents', 'learning', 'runtime design'],
  },
  {
    id: 'phenomenology-of-search',
    kind: 'Deep Dive',
    title: 'The Phenomenology of Search',
    subtitle: 'How LLMs navigate second-order representations',
    readingTime: '18 min',
    url: 'https://ai-news-hub.performics-labs.com/analysis/phenomenology-search-llm-second-order-representations',
    tags: ['search', 'authority', 'meaning'],
  },
  {
    id: 'news-feed',
    kind: 'News',
    title: 'AI News Analysis Feed',
    subtitle: '40+ short analyses mapped to marketing infrastructure shifts',
    readingTime: 'Daily',
    url: 'https://ai-news-hub.performics-labs.com/',
    tags: ['news', 'adtech', 'signals'],
  },
] as const;

export const labPrinciples: readonly { label: string; value: string }[] = [
  { label: 'Metric', value: 'Human agency over conversion' },
  { label: 'Method', value: 'Build to learn, then distill' },
  { label: 'Architecture', value: 'Clear boundaries, observable flows, reusable contracts' },
  { label: 'Interface', value: 'Tools that clarify intent and reduce operational ambiguity' },
  { label: 'Constraint', value: 'Confidence gating, provenance, and policy-aware controls' },
] as const;
