import { dessiProfileProjection } from '../dessi';
import { PUBLIC_WRITING_SCHEMA_VERSION } from './contracts';
import { definePublicWritingModule } from './validation';

const reviewedOn = '2026-08-02';
const archiveUrl = 'https://ai-news-hub.performics-labs.com/analysis';

const professionalAuthorship = {
  byline: 'Performics Labs',
  contribution:
    "Professional article selected as evidence of Dessi's technical synthesis and design judgement.",
  contributionConfidence: 'self-reported',
} as const;

export const dessiWritingModule = definePublicWritingModule({
  schemaVersion: PUBLIC_WRITING_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  writingVersion: 1,
  status: 'published',
  title: 'Technical Writing',
  description:
    'Selected professional analysis connected to systems Dessi has built or investigated.',
  entries: [
    {
      id: 'agentic-commerce-readiness',
      kind: 'Technical analysis',
      title: 'The Agentic Commerce Readiness Stack',
      subtitle:
        'How should brands become discoverable to shopping agents while controlling what those agents may do?',
      readingTime: '24 min',
      publishedOn: '2026-06-01',
      reviewedOn,
      status: 'published',
      url: 'https://ai-news-hub.performics-labs.com/analysis/agentic-commerce-readiness-stack-discoverability-control-plane',
      topics: ['agentic commerce', 'control planes', 'protocols', 'validation'],
      relatedSystem: 'Agentic Commerce Control Plane',
      boundary:
        'Architecture synthesis linked to an active prototype; it does not establish production-scale performance.',
      authorship: professionalAuthorship,
      evidence: [
        {
          label: 'Published article',
          url: 'https://ai-news-hub.performics-labs.com/analysis/agentic-commerce-readiness-stack-discoverability-control-plane',
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
      readingTime: '24 min',
      publishedOn: '2026-05-04',
      reviewedOn,
      status: 'published',
      url: 'https://ai-news-hub.performics-labs.com/analysis/building-secure-marketing-agents-ad-platform-authentication-architecture',
      topics: ['agent identity', 'policy', 'approval gates', 'audit'],
      relatedSystem: 'Programmatic automation and agent-policy work',
      boundary:
        'A reference architecture informed by professional practice; employer implementation details remain private.',
      authorship: professionalAuthorship,
      evidence: [
        {
          label: 'Published article',
          url: 'https://ai-news-hub.performics-labs.com/analysis/building-secure-marketing-agents-ad-platform-authentication-architecture',
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
      readingTime: '26 min',
      publishedOn: '2026-04-06',
      reviewedOn,
      status: 'published',
      url: 'https://ai-news-hub.performics-labs.com/analysis/deterministic-core-algorithms-data-structures-marketing-agents',
      topics: ['algorithms', 'tool routing', 'state', 'reliability'],
      relatedSystem: 'AI Harness Lab and agent runtime design',
      boundary:
        'A practitioner guide with worked patterns; examples are explanatory rather than performance benchmarks.',
      authorship: professionalAuthorship,
      evidence: [
        {
          label: 'Published article',
          url: 'https://ai-news-hub.performics-labs.com/analysis/deterministic-core-algorithms-data-structures-marketing-agents',
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
      readingTime: '29 min',
      publishedOn: '2026-03-21',
      reviewedOn,
      status: 'published',
      url: 'https://ai-news-hub.performics-labs.com/analysis/agent-maintenance-security-harness',
      topics: ['coding agents', 'skills', 'security', 'maintenance'],
      relatedSystem: 'Codex capability and AI Skills work',
      boundary:
        'A synthesis of public agent patterns and operational practice; it is not a coding-agent benchmark.',
      authorship: professionalAuthorship,
      evidence: [
        {
          label: 'Published article',
          url: 'https://ai-news-hub.performics-labs.com/analysis/agent-maintenance-security-harness',
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
      readingTime: '30 min',
      publishedOn: '2026-02-08',
      reviewedOn,
      status: 'published',
      url: 'https://ai-news-hub.performics-labs.com/analysis/building-to-learn-agentic-marketing-optimization',
      topics: ['experiments', 'agentic marketing', 'validation', 'learning loops'],
      relatedSystem: 'Agentic Commerce learning loop',
      boundary:
        'A prototype retrospective that separates simulated validation from observed commercial outcomes.',
      authorship: professionalAuthorship,
      evidence: [
        {
          label: 'Published article',
          url: 'https://ai-news-hub.performics-labs.com/analysis/building-to-learn-agentic-marketing-optimization',
          kind: 'article',
        },
      ],
    },
  ],
  archive: {
    label: 'Performics Labs analysis archive',
    url: archiveUrl,
    boundary:
      'The complete archive includes industry coverage and earlier conceptual essays that are not treated as profile evidence.',
  },
  publication: {
    approvedBy: 'owner',
    reviewedAt: '2026-08-02T00:00:00Z',
    publishedAt: '2026-08-02T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Only owner-reviewed published writing and public evidence links may enter this module. Drafts and private source material remain excluded.',
  },
} as const);
