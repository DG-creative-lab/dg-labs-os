export const workbenchCategories = ['Selected Systems', 'Professional Context'] as const;

export type WorkbenchCategory = (typeof workbenchCategories)[number];

export type WorkbenchItem = {
  id: string;
  category: WorkbenchCategory;
  classification: string;
  title: string;
  subtitle: string;
  summary: string;
  stack: readonly string[];
  links: Partial<{
    repo: string;
    article: string;
    demo: string;
    site: string;
  }>;
  highlights: readonly string[];
};

export const workbench: readonly WorkbenchItem[] = [
  {
    id: 'agentic-commerce-loop',
    category: 'Selected Systems',
    classification: 'Collaborative public system · Active',
    title: 'Agentic Commerce Learning Loop',
    subtitle: 'A governed loop for testing, learning, and revising product intelligence',
    summary:
      'A multi-tenant agent system that separates simulation, observed validation, belief revision, memory, and human approval.',
    stack: [
      'Next.js',
      'TypeScript',
      'FastAPI',
      'Python',
      'SQLite',
      'OpenRouter',
      'pytest',
      'CI/CD',
    ],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
      article:
        'https://ai-news-hub.performics-labs.com/analysis/building-to-learn-agentic-marketing-optimization',
    },
    highlights: [
      'Scopes beliefs and evidence across client, brand, and product boundaries.',
      'Keeps synthetic judgements distinct from observed outcomes.',
      'Uses confidence-gated memory with provenance and explicit revision paths.',
      'Tests policy, replay, recovery, validation, and receipt integrity.',
    ],
  },
  {
    id: 'learning-foundry',
    category: 'Selected Systems',
    classification: 'Submitted public system · Judging state preserved',
    title: 'Learning Foundry',
    subtitle: 'Constructive learning with evidence, interpretation, and agency kept distinct',
    summary:
      'A learning environment where evidence, human understanding, shared theory, agent memory, and activated capabilities remain reviewable.',
    stack: ['TypeScript', 'React', 'Codex', 'Evidence ledger', 'Deterministic projections'],
    links: {
      repo: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry/tree/0547da02518f432fdd85e79d317e1fedaa51c4c1',
    },
    highlights: [
      'Append-only evidence and deterministic projections preserve provenance.',
      'A consent-gated Codex adapter separates preparation from activation.',
      'Corrections can revise interpretation without rewriting original evidence.',
      'The linked commit preserves the submitted OpenAI Build Week state.',
    ],
  },
  {
    id: 'dg-os',
    category: 'Selected Systems',
    classification: 'Personal public system · Active',
    title: 'DG-OS',
    subtitle: 'A portfolio evolving into an inspectable knowledge and agent interface',
    summary:
      'The system visitors are using now: an OS-shaped interface connecting projects, professional context, writing, evidence, and grounded agent interactions.',
    stack: ['Astro', 'React', 'TypeScript', 'Retrieval', 'Provider gateway', 'Streaming'],
    links: {
      repo: 'https://github.com/DG-creative-lab/dg-labs-os',
      site: 'https://dg-os.com/',
    },
    highlights: [
      'Combines deterministic navigation with retrieval-grounded agent responses.',
      'Exposes source, provider health, fallback, and recovery behaviour.',
      'Represents claims with provenance, confidence, visibility, and boundaries.',
      'Uses the portfolio itself as an evolving systems-design experiment.',
    ],
  },
  {
    id: 'intent-geometry-agent',
    category: 'Selected Systems',
    classification: 'Collaborative public experiment',
    title: 'Intent Recognition Agent',
    subtitle: 'An applied-AI experiment for interpreting intent beyond keyword matching',
    summary:
      'An inspectable prototype combining contextual signals, intent classification, behavioural embeddings, clustering, and activation.',
    stack: ['Python', 'Gradio', 'SQLite', 'sentence-transformers', 'HDBSCAN', 'OpenRouter'],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
      demo: 'https://huggingface.co/spaces/Dessi/gradio-mcp-hack',
      article:
        'https://ai-news-hub.performics-labs.com/analysis/geometry-of-intention-llms-human-goals-marketing',
    },
    highlights: [
      'Captures contextual signals across identity, history, situation, and constraints.',
      'Calibrates intent classifications with explicit signal-strength modifiers.',
      'Uses embeddings and HDBSCAN to discover and inspect behavioural patterns.',
      'Connects analysis to bounded activation and privacy-aware audience export.',
    ],
  },
  {
    id: 'gateplane-enterprise-auth',
    category: 'Selected Systems',
    classification: 'Personal deployed system · Private source',
    title: 'Gateplane Enterprise Auth Platform',
    subtitle: 'Identity, tenant isolation, and policy boundaries for enterprise AI systems',
    summary:
      'A provider-independent control plane for hosted SSO, governed configuration, delegated agent authority, scoped workspace data, and sandbox-ready execution.',
    stack: ['Next.js', 'FastAPI', 'Microsoft Entra SSO', 'OIDC', 'Postgres', 'RBAC'],
    links: {
      site: 'https://gateplane-beta.vercel.app/overview',
    },
    highlights: [
      'Separates tenant, organisation, workspace, and capability boundaries.',
      'Binds delegated agent grants and approvals to explicit authority.',
      'Scopes workspace materialisation to deterministic agent-run namespaces.',
      'The product overview is public; source code and provisioned access remain private.',
    ],
  },
  {
    id: 'enterprise-multi-tenant-platform',
    category: 'Professional Context',
    classification: 'Employer system · Outcome-level description',
    title: 'Multi-Tenant Marketing Automation',
    subtitle: 'Enterprise orchestration across clients, markets, data, and activation',
    summary:
      'Professional production experience connecting tenant-aware data, authentication, AI orchestration, and campaign optimisation workflows.',
    stack: [
      'AWS',
      'Microsoft Entra',
      'Databricks',
      'Bedrock',
      'Row-level security',
      'Ad platforms',
    ],
    links: {},
    highlights: [
      'Supports enterprise hierarchies across clients, brands, and markets.',
      'Connects authenticated workflows to lakehouse and performance data.',
      'Coordinates optimisation and activation across external platforms.',
      'Only architectural scope is described; employer code and operational details remain private.',
    ],
  },
] as const;
