export type LabNote = {
  id: string;
  kind: 'Build note' | 'Implementation guide' | 'Reference architecture' | 'Technical analysis';
  title: string;
  subtitle: string;
  readingTime: string;
  published: string;
  url: string;
  tags: readonly string[];
  relatedSystem: string;
  boundary: string;
};

/**
 * Selected professional writing published under the Performics Labs byline.
 *
 * The internal `labNotes` name is retained for terminal and API compatibility.
 * Public interfaces present this material as Technical Writing.
 */
export const labNotes: readonly LabNote[] = [
  {
    id: 'agentic-commerce-readiness',
    kind: 'Technical analysis',
    title: 'The Agentic Commerce Readiness Stack',
    subtitle:
      'How should brands become discoverable to shopping agents while controlling what those agents may do?',
    readingTime: '24 min',
    published: '2026-06-01',
    url: 'https://ai-news-hub.performics-labs.com/analysis/agentic-commerce-readiness-stack-discoverability-control-plane',
    tags: ['agentic commerce', 'control planes', 'protocols', 'validation'],
    relatedSystem: 'Agentic Commerce Control Plane',
    boundary:
      'Architecture synthesis linked to an active prototype; it does not establish production-scale performance.',
  },
  {
    id: 'secure-marketing-agents',
    kind: 'Reference architecture',
    title: 'Secure Marketing Agents',
    subtitle:
      'What identity, policy, approval, and audit boundaries are required before an agent may change an ad platform?',
    readingTime: '24 min',
    published: '2026-05-04',
    url: 'https://ai-news-hub.performics-labs.com/analysis/building-secure-marketing-agents-ad-platform-authentication-architecture',
    tags: ['agent identity', 'policy', 'approval gates', 'audit'],
    relatedSystem: 'Programmatic automation and agent-policy work',
    boundary:
      'A reference architecture informed by professional practice; employer implementation details remain private.',
  },
  {
    id: 'deterministic-core',
    kind: 'Implementation guide',
    title: 'The Deterministic Core',
    subtitle:
      'Which classical algorithms keep agent tools predictable when model behaviour is probabilistic?',
    readingTime: '26 min',
    published: '2026-04-06',
    url: 'https://ai-news-hub.performics-labs.com/analysis/deterministic-core-algorithms-data-structures-marketing-agents',
    tags: ['algorithms', 'tool routing', 'state', 'reliability'],
    relatedSystem: 'AI Harness Lab and agent runtime design',
    boundary:
      'A practitioner guide with worked patterns; examples are explanatory rather than performance benchmarks.',
  },
  {
    id: 'agent-maintenance-harness',
    kind: 'Implementation guide',
    title: "The Code Agent's Playbook",
    subtitle:
      'What repository, maintenance, and security skills does a coding agent need before it can work responsibly?',
    readingTime: '29 min',
    published: '2026-03-21',
    url: 'https://ai-news-hub.performics-labs.com/analysis/agent-maintenance-security-harness',
    tags: ['coding agents', 'skills', 'security', 'maintenance'],
    relatedSystem: 'Codex capability and AI Skills work',
    boundary:
      'A synthesis of public agent patterns and operational practice; it is not a coding-agent benchmark.',
  },
  {
    id: 'building-to-learn',
    kind: 'Build note',
    title: 'Building to Learn',
    subtitle:
      'What changed after three weeks of prototyping an agentic marketing optimisation lab?',
    readingTime: '30 min',
    published: '2026-02-08',
    url: 'https://ai-news-hub.performics-labs.com/analysis/building-to-learn-agentic-marketing-optimization',
    tags: ['experiments', 'agentic marketing', 'validation', 'learning loops'],
    relatedSystem: 'Agentic Commerce learning loop',
    boundary:
      'A prototype retrospective that separates simulated validation from observed commercial outcomes.',
  },
] as const;
