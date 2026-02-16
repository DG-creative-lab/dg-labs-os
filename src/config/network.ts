export type NetworkNode = {
  id: string;
  kind: 'Role' | 'Org' | 'Project' | 'Artifact' | 'Idea';
  title: string;
  subtitle: string;
  period?: string;
  tags: readonly string[];
  links?: Partial<{
    url: string;
    repo: string;
    article: string;
  }>;
  bullets: readonly string[];
};

export const networkNodes: readonly NetworkNode[] = [
  {
    id: 'performics-innovations-lab',
    kind: 'Org',
    title: 'Performics (Publicis Media)',
    subtitle: 'Innovations Lab',
    period: 'Nov 2023 - Present',
    tags: ['multi-tenant', 'aws', 'agentic', 'adtech'],
    bullets: [
      'Multi-tenant marketing automation platform across enterprise clients and markets.',
      'AWS-native deployment patterns + lakehouse-oriented data flows (Databricks).',
      'OIDC with Microsoft Entra SSO + hierarchical tenant modeling.',
      'AI orchestration layers for campaign optimization.',
    ],
  },
  {
    id: 'publicis-warehouse-award',
    kind: 'Project',
    title: 'Publicis Warehouse (Amazon Optimization)',
    subtitle: 'Award-winning ecommerce marketing optimization platform',
    period: 'Platform contribution',
    tags: ['fastapi', 'glue', 'lambda', 'postgres', 'microservices'],
    links: {
      article:
        'https://www.performancemarketingworldawards.com/finalists/unifying-retail-data-with-publicis-warehouse-7y3bxeifqg035ne',
    },
    bullets: [
      'Backend services in FastAPI with production AWS deployment.',
      'Glue jobs for data processing, Lambda for event triggers.',
      'Postgres RDS persistence with microservice boundaries.',
    ],
  },
  {
    id: 'intent-geometry',
    kind: 'Artifact',
    title: 'Geometry of Intention',
    subtitle: 'Deep dive: latent goal inference and context structure',
    tags: ['intent', 'representation', 'evaluation'],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/geometry-of-intention-llms-human-goals-marketing',
    },
    bullets: [
      'Intent as a geometric constraint satisfaction problem under context.',
      'Structured signals to activate stable submanifolds (theory-of-mind inference).',
      'Design implications for empowerment-first optimization.',
    ],
  },
  {
    id: 'memory-agency',
    kind: 'Artifact',
    title: 'Memory and Agency',
    subtitle: 'Deep dive: memory systems, learning loops, and provenance',
    tags: ['memory', 'agents', 'learning'],
    links: {
      article: 'https://ai-news-hub.performics-labs.com/analysis/memory-and-agency',
    },
    bullets: [
      'Memory as distillation, not logging.',
      'Confidence gating and provenance to prevent compounding errors.',
      'Practical patterns for agents that learn over time.',
    ],
  },
  {
    id: 'empowerment',
    kind: 'Idea',
    title: 'Empowerment vs Extraction',
    subtitle: 'Operating principle for system design',
    tags: ['agency', 'ethics', 'metrics'],
    bullets: [
      'If intent recognition works, the real question becomes what we optimize for.',
      'Shift from persuasion tooling toward human-capability tooling.',
      'Measure flourishing, not just conversion.',
    ],
  },
] as const;

export const networkLinks = {
  githubOrg: 'https://github.com/orgs/ai-knowledge-hub/repositories',
  githubPersonal: 'https://github.com/DG-creative-lab',
  newsHub: 'https://ai-news-hub.performics-labs.com/',
} as const;
