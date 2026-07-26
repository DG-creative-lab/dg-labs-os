export type WorkbenchItem = {
  id: string;
  category: 'Research Systems' | 'Platforms' | 'Writing' | 'Hackathons';
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
    id: 'intent-geometry-agent',
    category: 'Research Systems',
    title: 'Intent Recognition Agent',
    subtitle: 'Geometry of Intention → inspectable marketing-intelligence prototype',
    summary:
      'Four-layer public system for intent recognition, pattern discovery, and activation. It turns a research thesis into an inspectable engineering prototype.',
    stack: [
      'Python',
      'Gradio',
      'SQLite',
      'sentence-transformers',
      'HDBSCAN',
      'OpenRouter',
      'Claude/GPT APIs',
    ],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
      demo: 'https://huggingface.co/spaces/Dessi/gradio-mcp-hack',
      article:
        'https://ai-news-hub.performics-labs.com/analysis/geometry-of-intention-llms-human-goals-marketing',
    },
    highlights: [
      'Context capture: identity/history/situation/behavior/time/constraints.',
      'Intent taxonomy + confidence calibration (signal strength modifiers).',
      'Behavioral embeddings + HDBSCAN clustering + persona stability checks.',
      'Activation: personalization, bid optimization, audience export (SHA-256 hashing).',
      'MCP server integration for ChatGPT / Claude Desktop / Cursor.',
    ],
  },
  {
    id: 'agentic-commerce-loop',
    category: 'Research Systems',
    title: 'Agentic Commerce Learning Loop',
    subtitle: 'Bayesian-style closed loop: simulate -> validate -> update beliefs',
    summary:
      'Multi-tenant product intelligence platform that iteratively improves discoverability with synthetic + observed validation, memory distillation, and confidence gating.',
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
      'Multi-tenant hierarchy: Client -> Brand -> Product with scoped beliefs.',
      'Dual validation: LLM judges (BYOK) + observed reality capture.',
      'Confidence-gated memory reuse + provenance tracking.',
      'Architecture boundary enforcement (domain/application/infrastructure).',
      'Protocol transparency APIs + scheduled loop maintenance.',
      '280+ Python tests cover policy, replay, recovery, validation, and receipt integrity.',
    ],
  },
  {
    id: 'ai-news-hub',
    category: 'Writing',
    title: 'Technical Writing (Performics Labs)',
    subtitle: 'Selected analysis backed by a maintained publishing system',
    summary:
      'Professional technical writing on agent architecture, commerce, system reliability, and applied AI, published alongside a broader industry-analysis archive.',
    stack: ['Astro', 'Content ops'],
    links: {
      site: 'https://ai-news-hub.performics-labs.com/',
    },
    highlights: [
      'Connects architecture questions to systems Dessi has built or investigated.',
      'Shows sustained technical synthesis and communication for practitioners.',
      'Presented as professional analysis rather than independent academic research.',
    ],
  },
  {
    id: 'enterprise-multi-tenant-platform',
    category: 'Platforms',
    title: 'Multi-Tenant Marketing Automation (Performics)',
    subtitle: 'Enterprise orchestration across global clients',
    summary:
      'Enterprise production platform spanning multi-tenant architecture, row-level security, authentication hierarchy design, and AI orchestration for campaign optimization.',
    stack: [
      'AWS',
      'OIDC (Microsoft Entra)',
      'Databricks',
      'Bedrock',
      'RLS',
      'Ad platform integrations',
    ],
    links: {},
    highlights: [
      'Multi-tenant system for enterprise clients across markets.',
      'OIDC auth + complex organizational hierarchies.',
      'Lakehouse patterns + performance data pipelines.',
      'Campaign optimization orchestration layers.',
    ],
  },
  {
    id: 'warehouse-award-platform',
    category: 'Platforms',
    title: 'Amazon Optimization Platform (Warehouse)',
    subtitle: 'Award-winning ecommerce marketing optimization',
    summary:
      'Built backend services and AWS data workflows for an ecommerce optimization platform using production microservice patterns.',
    stack: ['FastAPI', 'AWS Glue', 'Lambda', 'Postgres (RDS)', 'Microservices'],
    links: {
      article:
        'https://www.performancemarketingworldawards.com/finalists/unifying-retail-data-with-publicis-warehouse-7y3bxeifqg035ne',
    },
    highlights: [
      'Backend services in FastAPI with production deployment on AWS.',
      'Glue jobs for data processing, Lambda triggers for events.',
      'Postgres RDS persistence and microservice boundaries.',
    ],
  },
  {
    id: 'gateplane-enterprise-auth',
    category: 'Platforms',
    title: 'Gateplane Enterprise Auth Platform',
    subtitle: 'Multi-tenant authentication and authorization architecture',
    summary:
      'Enterprise auth platform with tenant isolation, hierarchical role boundaries, and capability-tier controls for multi-tenant AI applications, now evolving toward agent-native workflows.',
    stack: [
      'Next.js',
      'FastAPI',
      'Microsoft Entra SSO',
      'OIDC',
      'Postgres',
      'RBAC',
      'Policy enforcement',
    ],
    links: {},
    highlights: [
      'Multi-tenant auth boundaries with strict tenant and organization scoping.',
      'Layered role model aligned to client, brand, and workspace contexts.',
      'Product-tier capability gating for enterprise feature control.',
      'Agentification implementation path adds agent-native workflows and defensive differentiation.',
      'Clean architecture patterns for auth and policy domain separation.',
    ],
  },
  {
    id: 'onesuite-labs-infra',
    category: 'Platforms',
    title: 'OneSuite Labs Ephemeral Infrastructure',
    subtitle: 'Decommissioning and scratch-environment control plane',
    summary:
      'AWS decommissioning and replacement strategy for legacy untagged infrastructure, rebuilt as reproducible ephemeral stacks for safe experimentation and systems validation.',
    stack: [
      'Terraform',
      'AWS',
      'Infrastructure as code',
      'Drift checks',
      'Runtime contracts',
      'Ephemeral environments',
    ],
    links: {},
    highlights: [
      'Infra cleanup for non-terraform and untagged legacy surfaces.',
      'Ephemeral up/down stacks mirroring app contracts for idea testing.',
      'Contract gates and drift detection in deployment workflows.',
      'Systematic infra governance for safer platform iteration.',
    ],
  },
  {
    id: 'learning-foundry',
    category: 'Hackathons',
    title: 'Learning Foundry',
    subtitle: 'OpenAI Build Week submission · frozen during judging',
    summary:
      'A constructive learning environment where evidence, human understanding, shared theory, agent memory, and activated capabilities remain distinct and reviewable.',
    stack: ['TypeScript', 'React', 'Codex', 'Evidence ledger', 'Deterministic projections'],
    links: {
      repo: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry/tree/0547da02518f432fdd85e79d317e1fedaa51c4c1',
    },
    highlights: [
      'Append-only evidence and deterministic projections preserve provenance.',
      'A consent-gated Codex adapter separates preparation from activation.',
      'Regression tests cover state transitions, IPC boundaries, accessibility, and fallbacks.',
      'The linked commit is the submitted state; no judging-period changes are made.',
    ],
  },
] as const;
