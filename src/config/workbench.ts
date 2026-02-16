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
    subtitle: 'Geometry of Intention -> production marketing intelligence',
    summary:
      'Four-layer system for intent recognition, pattern discovery, and activation. Built to prove marketing intelligence can optimize for genuine human intent rather than manipulation.',
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
      'Multi-tenant platform that iteratively improves product discoverability with synthetic + observed validation, memory distillation, and confidence gating.',
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
    ],
  },
  {
    id: 'ai-news-hub',
    category: 'Writing',
    title: 'AI Knowledge Hub (Performics Labs)',
    subtitle: 'Technical writing as infrastructure',
    summary:
      'Content platform: daily news analysis + deep research pieces + community All Hands. Focused on practitioners building marketing infrastructure with AI.',
    stack: ['Astro', 'Content ops'],
    links: {
      site: 'https://ai-news-hub.performics-labs.com/',
    },
    highlights: [
      'Deep dives: Geometry of Intention, Memory & Agency, Phenomenology of Search, Empowerment Imperative.',
      'Bridges philosophy + systems engineering for real builders.',
      'Grew to 200+ organic followers in 6 months via consistent depth.',
    ],
  },
  {
    id: 'enterprise-multi-tenant-platform',
    category: 'Platforms',
    title: 'Multi-Tenant Marketing Automation (Performics)',
    subtitle: 'Enterprise orchestration across global clients',
    summary:
      'Contributed to multi-tenant architecture, row-level security patterns, authentication hierarchy design, and AI orchestration layers for campaign optimization.',
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
      'Built backend services and AWS data processing for an ecommerce marketing optimization platform using microservice patterns.',
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
    id: 'hackathons',
    category: 'Hackathons',
    title: 'Hackathon Prototypes',
    subtitle: 'Community-first building',
    summary:
      'Rapid prototypes exploring multi-agent orchestration, planning frameworks, and tool reliability. Built to inspire builders, not optimize for judges.',
    stack: ['Agents', 'Tooling', 'Prototyping'],
    links: {},
    highlights: [
      'ARIA Space Rider Mission Control: multi-agent mission management.',
      'Routine + Mastra: structured plans and parameter passing patterns.',
      'Agent reliability: reducing tool-use errors via explicit workflows.',
    ],
  },
] as const;
