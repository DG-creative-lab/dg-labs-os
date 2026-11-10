import { dessiProfileProjection } from '../dessi';
import { PUBLIC_WRITING_SCHEMA_VERSION } from './contracts';
import { definePublicWritingModule } from './validation';

const reviewedOn = '2026-11-10';
const archiveUrl = 'https://ai-knowledge-hub.org/library/';

const revisedEditionAuthorship = {
  byline: 'Dessi Georgieva',
  contribution: 'Wrote the article and published the revised edition on AI Knowledge Hub.',
  contributionConfidence: 'verified',
} as const;

export const dessiWritingModule = definePublicWritingModule({
  schemaVersion: PUBLIC_WRITING_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  writingVersion: 2,
  status: 'published',
  title: 'Technical Writing',
  description:
    'AI Knowledge Hub is Dessi’s independent publication on AI in marketing, growth, and go-to-market. This selection brings together research, essays, and engineering guides.',
  entries: [
    {
      id: 'distribution-and-growth',
      kind: 'Technical analysis',
      title: 'Distribution Alone Is Not a Moat: The Growth Playbook for the GPT Ads Era',
      subtitle: 'How can teams turn rented reach into retained value and a business advantage?',
      readingTime: '23 min',
      publishedOn: '2026-09-12',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/distribution-not-moat-growth-playbook-gpt-ads-era/',
      topics: ['growth', 'go-to-market', 'distribution', 'retention'],
      relatedSystem: 'Growth and go-to-market research',
      boundary:
        'An essay about channel strategy and durable growth. Examples illustrate the argument.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/distribution-not-moat-growth-playbook-gpt-ads-era/',
          kind: 'article',
        },
      ],
    },
    {
      id: 'agentic-commerce-readiness',
      kind: 'Technical analysis',
      title: 'The Agentic Commerce Readiness Stack',
      subtitle:
        'How should brands become discoverable to shopping agents while controlling what those agents may do?',
      readingTime: '21 min',
      publishedOn: '2026-06-01',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/agentic-commerce-readiness-stack-discoverability-control-plane/',
      topics: ['agentic commerce', 'control planes', 'protocols', 'validation'],
      relatedSystem: 'Agentic Commerce Control Plane',
      boundary:
        'Architecture synthesis linked to an active prototype; it does not establish production-scale performance.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/agentic-commerce-readiness-stack-discoverability-control-plane/',
          kind: 'article',
        },
      ],
    },
    {
      id: 'secure-marketing-agents',
      kind: 'Reference architecture',
      title: 'Secure Marketing Agents',
      subtitle:
        'What identity, policy, approval, and audit boundaries are required before an agent may change an ad platform?',
      readingTime: '17 min',
      publishedOn: '2026-05-04',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/building-secure-marketing-agents-ad-platform-authentication-architecture/',
      topics: ['agent identity', 'policy', 'approval gates', 'audit'],
      relatedSystem: 'Programmatic automation and agent-policy work',
      boundary:
        'A reference architecture informed by professional practice; employer implementation details remain private.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/building-secure-marketing-agents-ad-platform-authentication-architecture/',
          kind: 'article',
        },
      ],
    },
    {
      id: 'deterministic-core',
      kind: 'Implementation guide',
      title: 'The Deterministic Core',
      subtitle:
        'Which classical algorithms keep agent tools predictable when model behaviour is probabilistic?',
      readingTime: '17 min',
      publishedOn: '2026-04-06',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/deterministic-core-algorithms-data-structures-marketing-agents/',
      topics: ['algorithms', 'tool routing', 'state', 'reliability'],
      relatedSystem: 'AI Harness Lab and agent runtime design',
      boundary:
        'A practitioner guide with worked patterns; examples are explanatory rather than performance benchmarks.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/deterministic-core-algorithms-data-structures-marketing-agents/',
          kind: 'article',
        },
      ],
    },
    {
      id: 'agent-maintenance-harness',
      kind: 'Implementation guide',
      title: "The Code Agent's Playbook",
      subtitle:
        'What repository, maintenance, and security skills does a coding agent need before it can work responsibly?',
      readingTime: '32 min',
      publishedOn: '2026-03-21',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/agent-maintenance-security-harness/',
      topics: ['coding agents', 'skills', 'security', 'maintenance'],
      relatedSystem: 'Codex capability and AI Skills work',
      boundary:
        'A synthesis of public agent patterns and operational practice; it is not a coding-agent benchmark.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/agent-maintenance-security-harness/',
          kind: 'article',
        },
      ],
    },
    {
      id: 'building-to-learn',
      kind: 'Build note',
      title: 'Building to Learn',
      subtitle:
        'What changed after three weeks of prototyping an agentic marketing optimisation lab?',
      readingTime: '16 min',
      publishedOn: '2026-02-08',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/building-to-learn-agentic-marketing-optimization/',
      topics: ['experiments', 'agentic marketing', 'validation', 'learning loops'],
      relatedSystem: 'Agentic Commerce learning loop',
      boundary:
        'A prototype retrospective that separates simulated validation from observed commercial outcomes.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/building-to-learn-agentic-marketing-optimization/',
          kind: 'article',
        },
      ],
    },
    {
      id: 'phenomenology-of-search',
      kind: 'Technical analysis',
      title: 'The Phenomenology of Search: From Similarity to Reasons for Trust',
      subtitle:
        'What should a search system preserve so readers can judge why an answer deserves trust?',
      readingTime: '12 min',
      publishedOn: '2025-09-14',
      reviewedOn,
      status: 'published',
      url: 'https://ai-knowledge-hub.org/library/phenomenology-search-llm-second-order-representations/',
      topics: ['research', 'search', 'representations', 'provenance'],
      relatedSystem: 'Search and meaning research',
      boundary: 'A research essay about representations and credibility in search.',
      authorship: revisedEditionAuthorship,
      evidence: [
        {
          label: 'AI Knowledge Hub edition',
          url: 'https://ai-knowledge-hub.org/library/phenomenology-search-llm-second-order-representations/',
          kind: 'article',
        },
      ],
    },
  ],
  archive: {
    label: 'Browse the AI Knowledge Hub library',
    url: archiveUrl,
    boundary:
      'The full library covers marketing, growth, go-to-market, and research, with practical guides and experiments in the Lab.',
  },
  publication: {
    approvedBy: 'owner',
    reviewedAt: '2026-11-10T00:00:00Z',
    publishedAt: '2026-11-10T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Only owner-reviewed published writing and public evidence links may enter this module. Drafts and private source material remain excluded.',
  },
} as const);
