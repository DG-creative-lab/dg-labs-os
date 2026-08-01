export type NetworkKind = 'Foundation' | 'Career' | 'Practice' | 'System' | 'Evidence';

export type NetworkEvidence =
  | 'Background'
  | 'Professional context'
  | 'Public artifact'
  | 'Practice';

export type NetworkNode = {
  id: string;
  kind: NetworkKind;
  title: string;
  subtitle: string;
  period?: string;
  evidence: NetworkEvidence;
  provenance: string;
  boundary: string;
  tags: readonly string[];
  bullets: readonly string[];
  map: {
    column: 0 | 1 | 2 | 3;
    row: number;
  };
  links?: Partial<{
    url: string;
    repo: string;
    article: string;
  }>;
};

export type NetworkRelation =
  | 'informed'
  | 'led to'
  | 'built during'
  | 'applied in'
  | 'supports'
  | 'documented by'
  | 'presented by'
  | 'shares pattern with';

export type NetworkIdeaEdge = {
  id: string;
  from: string;
  to: string;
  relation: NetworkRelation;
  evidence: string;
  confidence: 'direct' | 'supported' | 'interpretive';
};

export type NetworkPath = {
  id: string;
  question: string;
  answer: string;
  nodeIds: readonly string[];
  edgeIds: readonly string[];
};

export const networkNodes: readonly NetworkNode[] = [
  {
    id: 'foundation-systems-knowledge',
    kind: 'Foundation',
    title: 'Systems & Knowledge',
    subtitle: 'Philosophy of science',
    period: '2003–2007',
    evidence: 'Background',
    provenance: 'BA Philosophy, Sofia University.',
    boundary:
      'Academic background explains an enduring interest in knowledge and systems; it is not evidence of engineering capability by itself.',
    tags: ['philosophy of science', 'knowledge', 'systems', 'reasoning'],
    bullets: [
      'Studied how knowledge claims are formed, tested, and revised.',
      'Provides intellectual context for later interest in inspectable systems.',
    ],
    map: { column: 0, row: 0 },
  },
  {
    id: 'foundation-human-systems',
    kind: 'Foundation',
    title: 'Human Systems',
    subtitle: 'Applied human rights',
    period: '2009–2011',
    evidence: 'Background',
    provenance: 'MA Applied Human Rights, University of York.',
    boundary:
      'This background informs questions about agency and accountability without establishing that every later design decision follows directly from it.',
    tags: ['human rights', 'agency', 'ethics', 'accountability'],
    bullets: [
      'Studied institutions, power, rights, and practical accountability.',
      'Offers context for the emphasis on human control in agent systems.',
    ],
    map: { column: 0, row: 1 },
  },
  {
    id: 'career-data-operations',
    kind: 'Career',
    title: 'Data Operations',
    subtitle: 'Mission-led and marketing organisations',
    period: '2012–2019',
    evidence: 'Professional context',
    provenance:
      'Roles spanning nonprofit operations, CRM data, SQL, segmentation, and data quality.',
    boundary:
      'This node compresses several early roles into one career era; detailed chronology remains in the Resume.',
    tags: ['sql', 'crm', 'data quality', 'segmentation', 'operations'],
    bullets: [
      'Built foundations in database stewardship, campaign data, and operational delivery.',
      'Moved from maintaining records toward designing repeatable data workflows.',
    ],
    map: { column: 0, row: 2.4 },
  },
  {
    id: 'career-analytics-platforms',
    kind: 'Career',
    title: 'Analytics Platforms',
    subtitle: 'BI, experimentation, and cloud data',
    period: '2019–2023',
    evidence: 'Professional context',
    provenance: 'Analytics and BI roles across Toaster, Founders Forum, Jellyfish, and Publicis.',
    boundary:
      'Employer systems are summarized at capability level because implementation artifacts are not publicly available.',
    tags: ['business intelligence', 'r shiny', 'aws', 'etl', 'data lakes'],
    bullets: [
      'Shifted from reporting delivery to reusable analytics products and cloud data foundations.',
      'Developed the operational habits later used in AI platform work.',
    ],
    map: { column: 0, row: 3.6 },
  },
  {
    id: 'career-ai-systems',
    kind: 'Career',
    title: 'AI Systems & Platforms',
    subtitle: 'Applied AI engineering',
    period: '2023–Present',
    evidence: 'Professional context',
    provenance: 'Professional work in Publicis and Performics innovation environments.',
    boundary:
      'Paid-work claims are intentionally high level. Public projects elsewhere in the map provide supporting, but not equivalent, evidence.',
    tags: ['agent systems', 'multi-tenant platforms', 'identity', 'infrastructure'],
    bullets: [
      'Builds agent systems, policy boundaries, multi-tenant platforms, and infrastructure controls.',
      'Connects product experiments to production constraints and operator accountability.',
    ],
    map: { column: 0, row: 4.8 },
  },
  {
    id: 'practice-identity-policy',
    kind: 'Practice',
    title: 'Identity & Policy',
    subtitle: 'Who may act, where, and with whose approval',
    evidence: 'Practice',
    provenance:
      'Recurring pattern across auth, tenant isolation, agent permissions, and approval gates.',
    boundary: 'A cross-project design practice, not a standalone shipped product.',
    tags: ['identity', 'policy', 'approval gates', 'tenant isolation', 'audit'],
    bullets: [
      'Separates user, agent, tenant, capability, and approval boundaries.',
      'Makes consequential automation conditional and reviewable.',
    ],
    map: { column: 1, row: 0.5 },
  },
  {
    id: 'practice-learning-loops',
    kind: 'Practice',
    title: 'Learning Loops',
    subtitle: 'Observe, update, and retain uncertainty',
    evidence: 'Practice',
    provenance: 'Implemented most explicitly in the Agentic Commerce prototype.',
    boundary:
      'Prototype learning loops demonstrate architecture and policy behavior, not commercial uplift.',
    tags: ['belief updates', 'feedback', 'memory', 'uncertainty', 'validation'],
    bullets: [
      'Keeps simulation, observation, belief update, and memory distinct.',
      'Uses confidence gates before learned state is reused.',
    ],
    map: { column: 1, row: 1.8 },
  },
  {
    id: 'practice-evaluation-evidence',
    kind: 'Practice',
    title: 'Evaluation & Evidence',
    subtitle: 'Claims remain tied to observable artifacts',
    evidence: 'Practice',
    provenance:
      'Visible in tests, validation receipts, deterministic projections, and portfolio boundaries.',
    boundary:
      'Test volume and structured evidence improve confidence but do not establish real-world impact alone.',
    tags: ['evaluation', 'provenance', 'testing', 'receipts', 'limitations'],
    bullets: [
      'Separates what was built, simulated, observed, and inferred.',
      'Treats limitations as part of the evidence rather than as footnotes.',
    ],
    map: { column: 1, row: 3.1 },
  },
  {
    id: 'practice-infrastructure-reliability',
    kind: 'Practice',
    title: 'Infrastructure Reliability',
    subtitle: 'Contracts, reproducibility, and controlled change',
    evidence: 'Practice',
    provenance: 'Professional infrastructure work and public system-design patterns.',
    boundary:
      'Private infrastructure details are not disclosed; the map records the operating pattern only.',
    tags: ['infrastructure as code', 'contracts', 'drift', 'ephemeral environments'],
    bullets: [
      'Uses reproducible environments and contract checks to reduce operational ambiguity.',
      'Treats cleanup, drift, and recovery as product responsibilities.',
    ],
    map: { column: 1, row: 4.4 },
  },
  {
    id: 'system-ai-skills',
    kind: 'System',
    title: 'AI Skills Platform',
    subtitle: 'Reusable capabilities for agent runtimes',
    period: '2024–Present',
    evidence: 'Public artifact',
    provenance: 'Public AI Knowledge Hub site and repository.',
    boundary:
      'The public catalog demonstrates reusable skill design; adoption and production impact require separate evidence.',
    tags: ['skills', 'agent orchestration', 'guardrails', 'open source'],
    bullets: [
      'Packages reusable marketing-agent capabilities with guardrails and tests.',
      'Supports Codex, Claude, and runtime-agnostic use.',
    ],
    map: { column: 2, row: 0 },
    links: {
      url: 'https://skills.ai-knowledge-hub.org/',
      repo: 'https://github.com/ai-knowledge-hub/all-hands',
    },
  },
  {
    id: 'system-gateplane',
    kind: 'System',
    title: 'Gateplane',
    subtitle: 'Multi-tenant identity and capability control',
    period: '2025–Present',
    evidence: 'Professional context',
    provenance: 'Private project developed from enterprise authentication requirements.',
    boundary:
      'The repository is private. Claims are limited to the architecture Dessi can describe without exposing employer or client material.',
    tags: ['oidc', 'entra', 'rbac', 'multi-tenant auth', 'capability gating'],
    bullets: [
      'Models tenant, organisation, role, and product-tier boundaries.',
      'Provides a route toward agent-native policy enforcement.',
    ],
    map: { column: 2, row: 1 },
  },
  {
    id: 'system-intent-recognition',
    kind: 'System',
    title: 'Intent Recognition',
    subtitle: 'Inspectable intent-inference prototype',
    period: '2024–Present',
    evidence: 'Public artifact',
    provenance:
      'Public repository and prototype derived from an applied marketing-intelligence question.',
    boundary:
      'The prototype demonstrates architecture and inference patterns; it is not evidence of production prediction accuracy.',
    tags: ['intent', 'embeddings', 'clustering', 'multi-agent', 'marketing intelligence'],
    bullets: [
      'Combines context capture, intent taxonomy, embeddings, clustering, and activation.',
      'Makes confidence and intermediate reasoning inspectable.',
    ],
    map: { column: 2, row: 2 },
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
      url: 'https://huggingface.co/spaces/Dessi/gradio-mcp-hack',
    },
  },
  {
    id: 'system-agentic-commerce',
    kind: 'System',
    title: 'Agentic Commerce',
    subtitle: 'Learning loop and discoverability control plane',
    period: '2024–Present',
    evidence: 'Public artifact',
    provenance: 'Public repository with implementation, tests, and technical writing.',
    boundary:
      'Observed and simulated validation remain distinct; the prototype does not claim commercial performance.',
    tags: ['agentic commerce', 'learning loops', 'multi-tenant', 'validation'],
    bullets: [
      'Updates product beliefs through simulated and observed validation.',
      'Uses confidence-gated memory, provenance, policy, and recovery tests.',
    ],
    map: { column: 2, row: 3 },
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
      article:
        'https://ai-news-hub.performics-labs.com/analysis/building-to-learn-agentic-marketing-optimization',
    },
  },
  {
    id: 'system-enterprise-automation',
    kind: 'System',
    title: 'Enterprise Automation',
    subtitle: 'Multi-tenant marketing and ecommerce systems',
    period: '2023–Present',
    evidence: 'Professional context',
    provenance: 'Paid platform work across marketing automation and ecommerce optimization.',
    boundary:
      'Client and employer implementation details remain private; only architectural scope and publicly verifiable recognition are included.',
    tags: ['multi-tenant', 'aws', 'databricks', 'campaign optimization', 'ecommerce'],
    bullets: [
      'Connects tenant-aware data, analytics, optimization, and execution workflows.',
      'Includes backend and AWS delivery for an award-recognized ecommerce platform.',
    ],
    map: { column: 2, row: 4 },
    links: {
      article:
        'https://www.performancemarketingworldawards.com/finalists/unifying-retail-data-with-publicis-warehouse-7y3bxeifqg035ne',
    },
  },
  {
    id: 'system-onesuite-infrastructure',
    kind: 'System',
    title: 'OneSuite Infrastructure',
    subtitle: 'Ephemeral environments and lifecycle control',
    period: '2025–Present',
    evidence: 'Professional context',
    provenance: 'Paid infrastructure work in the OneSuite platform environment.',
    boundary:
      'Operational details and source remain private; the map records the reproducibility and governance pattern.',
    tags: ['terraform', 'aws', 'ephemeral environments', 'drift', 'decommissioning'],
    bullets: [
      'Replaces legacy infrastructure with reproducible scratch environments.',
      'Adds contract checks, drift awareness, and controlled lifecycle operations.',
    ],
    map: { column: 2, row: 5 },
  },
  {
    id: 'system-dg-os',
    kind: 'System',
    title: 'DG-OS',
    subtitle: 'Portfolio evolving into a working knowledge interface',
    period: '2025–Present',
    evidence: 'Public artifact',
    provenance: 'The portfolio application currently being inspected.',
    boundary:
      'The current release is a curated interface; automated source ingestion and the private learning plane remain future work.',
    tags: ['portfolio', 'knowledge interface', 'agents', 'evidence'],
    bullets: [
      'Connects systems, writing, career context, and evidence through an OS metaphor.',
      'Designed to evolve from a portfolio into a personal constructive-learning surface.',
    ],
    map: { column: 2, row: 6 },
    links: {
      repo: 'https://github.com/DG-creative-lab/dg-labs-os',
      url: 'https://dg-os.com/',
    },
  },
  {
    id: 'evidence-technical-writing',
    kind: 'Evidence',
    title: 'Technical Writing',
    subtitle: 'Selected Performics Labs analysis',
    period: '2024–Present',
    evidence: 'Public artifact',
    provenance: 'Published under the Performics Labs byline.',
    boundary:
      'Professional technical writing demonstrates synthesis and communication, not independent academic research or sole authorship.',
    tags: ['technical writing', 'architecture', 'analysis', 'communication'],
    bullets: [
      'Documents architecture questions connected to systems built or investigated.',
      'Selected pieces state their related system and limitations.',
    ],
    map: { column: 3, row: 1.2 },
    links: {
      url: 'https://ai-news-hub.performics-labs.com/analysis',
    },
  },
  {
    id: 'evidence-learning-foundry',
    kind: 'Evidence',
    title: 'Learning Foundry',
    subtitle: 'Constructive-learning experiment',
    period: '2026',
    evidence: 'Public artifact',
    provenance: 'OpenAI Build Week submission preserved at the submitted commit.',
    boundary:
      'The linked state is a hackathon prototype. It demonstrates interaction and evidence design, not a mature learning product.',
    tags: ['constructive learning', 'evidence ledger', 'consent', 'agent memory'],
    bullets: [
      'Keeps evidence, understanding, theory, memory, and activated capability distinct.',
      'Uses append-only evidence and consent-gated agent actions.',
    ],
    map: { column: 3, row: 3.4 },
    links: {
      repo: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry/tree/0547da02518f432fdd85e79d317e1fedaa51c4c1',
    },
  },
] as const;

export const networkIdeaEdges: readonly NetworkIdeaEdge[] = [
  {
    id: 'foundation-knowledge-to-evaluation',
    from: 'foundation-systems-knowledge',
    to: 'practice-evaluation-evidence',
    relation: 'informed',
    evidence: 'Both focus on how claims are formed, tested, and revised.',
    confidence: 'interpretive',
  },
  {
    id: 'foundation-human-to-policy',
    from: 'foundation-human-systems',
    to: 'practice-identity-policy',
    relation: 'informed',
    evidence: 'Human control and accountability recur in later agent-policy work.',
    confidence: 'interpretive',
  },
  {
    id: 'career-data-to-analytics',
    from: 'career-data-operations',
    to: 'career-analytics-platforms',
    relation: 'led to',
    evidence: 'Career chronology moved from operational data work into analytics products.',
    confidence: 'direct',
  },
  {
    id: 'career-analytics-to-ai',
    from: 'career-analytics-platforms',
    to: 'career-ai-systems',
    relation: 'led to',
    evidence:
      'Cloud data and product analytics became the foundation for applied AI platform work.',
    confidence: 'direct',
  },
  {
    id: 'career-ai-to-enterprise',
    from: 'career-ai-systems',
    to: 'system-enterprise-automation',
    relation: 'built during',
    evidence: 'Enterprise automation is part of Dessi’s paid AI-platform scope.',
    confidence: 'supported',
  },
  {
    id: 'career-ai-to-gateplane',
    from: 'career-ai-systems',
    to: 'system-gateplane',
    relation: 'built during',
    evidence: 'Gateplane grew from enterprise multi-tenant identity requirements.',
    confidence: 'supported',
  },
  {
    id: 'career-ai-to-intent',
    from: 'career-ai-systems',
    to: 'system-intent-recognition',
    relation: 'built during',
    evidence:
      'The public prototype represents applied intent work developed in an innovation context.',
    confidence: 'supported',
  },
  {
    id: 'career-ai-to-commerce',
    from: 'career-ai-systems',
    to: 'system-agentic-commerce',
    relation: 'built during',
    evidence: 'The public prototype expands an applied agentic-commerce question.',
    confidence: 'supported',
  },
  {
    id: 'career-ai-to-infrastructure',
    from: 'career-ai-systems',
    to: 'system-onesuite-infrastructure',
    relation: 'built during',
    evidence: 'The infrastructure work belongs to Dessi’s current professional platform scope.',
    confidence: 'supported',
  },
  {
    id: 'identity-to-gateplane',
    from: 'practice-identity-policy',
    to: 'system-gateplane',
    relation: 'applied in',
    evidence: 'Gateplane explicitly models tenant, role, and capability boundaries.',
    confidence: 'direct',
  },
  {
    id: 'identity-to-enterprise',
    from: 'practice-identity-policy',
    to: 'system-enterprise-automation',
    relation: 'applied in',
    evidence:
      'Enterprise platforms require tenant isolation, authentication, and controlled execution.',
    confidence: 'supported',
  },
  {
    id: 'identity-to-learning-foundry',
    from: 'practice-identity-policy',
    to: 'evidence-learning-foundry',
    relation: 'applied in',
    evidence: 'Learning Foundry separates preparation from consent-gated activation.',
    confidence: 'direct',
  },
  {
    id: 'learning-to-commerce',
    from: 'practice-learning-loops',
    to: 'system-agentic-commerce',
    relation: 'applied in',
    evidence: 'Belief updates, validation, and memory reuse are implemented in the prototype.',
    confidence: 'direct',
  },
  {
    id: 'evaluation-to-commerce',
    from: 'practice-evaluation-evidence',
    to: 'system-agentic-commerce',
    relation: 'applied in',
    evidence:
      'Tests and receipts distinguish simulation, observation, replay, recovery, and policy.',
    confidence: 'direct',
  },
  {
    id: 'evaluation-to-learning-foundry',
    from: 'practice-evaluation-evidence',
    to: 'evidence-learning-foundry',
    relation: 'applied in',
    evidence: 'The prototype uses append-only evidence and deterministic projections.',
    confidence: 'direct',
  },
  {
    id: 'infrastructure-to-onesuite',
    from: 'practice-infrastructure-reliability',
    to: 'system-onesuite-infrastructure',
    relation: 'applied in',
    evidence: 'Ephemeral stacks, drift checks, and lifecycle control define the system.',
    confidence: 'direct',
  },
  {
    id: 'infrastructure-to-enterprise',
    from: 'practice-infrastructure-reliability',
    to: 'system-enterprise-automation',
    relation: 'supports',
    evidence: 'AWS delivery and data workflows depend on reproducible operational boundaries.',
    confidence: 'supported',
  },
  {
    id: 'skills-to-intent',
    from: 'system-ai-skills',
    to: 'system-intent-recognition',
    relation: 'shares pattern with',
    evidence: 'Both expose bounded capabilities to agent runtimes through explicit interfaces.',
    confidence: 'supported',
  },
  {
    id: 'skills-to-dgos',
    from: 'system-ai-skills',
    to: 'system-dg-os',
    relation: 'supports',
    evidence:
      'DG-OS is intended to invoke reusable Codex capabilities as its automation layer evolves.',
    confidence: 'interpretive',
  },
  {
    id: 'commerce-to-writing',
    from: 'system-agentic-commerce',
    to: 'evidence-technical-writing',
    relation: 'documented by',
    evidence:
      'Selected articles explain the prototype, readiness stack, and learning-loop boundaries.',
    confidence: 'direct',
  },
  {
    id: 'identity-to-writing',
    from: 'practice-identity-policy',
    to: 'evidence-technical-writing',
    relation: 'documented by',
    evidence:
      'The secure-marketing-agents reference architecture documents identity and policy boundaries.',
    confidence: 'supported',
  },
  {
    id: 'evaluation-to-writing',
    from: 'practice-evaluation-evidence',
    to: 'evidence-technical-writing',
    relation: 'documented by',
    evidence:
      'Selected implementation guides explain deterministic and evidence-oriented agent patterns.',
    confidence: 'supported',
  },
  {
    id: 'learning-foundry-to-dgos',
    from: 'evidence-learning-foundry',
    to: 'system-dg-os',
    relation: 'informed',
    evidence:
      'Its separation of evidence, memory, and capability informs the planned private learning plane.',
    confidence: 'interpretive',
  },
  {
    id: 'writing-to-dgos',
    from: 'evidence-technical-writing',
    to: 'system-dg-os',
    relation: 'presented by',
    evidence:
      'DG-OS curates the strongest technical pieces and states their provenance and limitations.',
    confidence: 'direct',
  },
] as const;

export const networkPaths: readonly NetworkPath[] = [
  {
    id: 'data-to-agents',
    question: 'How did Dessi move from data work to agent systems?',
    answer:
      'Operational data work became analytics platforms, then multi-tenant AI systems where evaluation and policy are first-class concerns.',
    nodeIds: [
      'career-data-operations',
      'career-analytics-platforms',
      'career-ai-systems',
      'system-enterprise-automation',
      'system-agentic-commerce',
    ],
    edgeIds: [
      'career-data-to-analytics',
      'career-analytics-to-ai',
      'career-ai-to-enterprise',
      'career-ai-to-commerce',
    ],
  },
  {
    id: 'commerce-credibility',
    question: 'What makes the agentic-commerce work credible?',
    answer:
      'The public prototype combines a learning-loop architecture with explicit validation, policy boundaries, tests, and writing that states what remains unproven.',
    nodeIds: [
      'career-ai-systems',
      'practice-learning-loops',
      'practice-evaluation-evidence',
      'practice-identity-policy',
      'system-agentic-commerce',
      'evidence-technical-writing',
    ],
    edgeIds: [
      'career-ai-to-commerce',
      'learning-to-commerce',
      'evaluation-to-commerce',
      'commerce-to-writing',
      'identity-to-writing',
    ],
  },
  {
    id: 'private-to-public',
    question: 'How does private work connect to public evidence?',
    answer:
      'Paid systems establish the professional context. Public prototypes, technical writing, and DG-OS expose related design patterns without pretending to reproduce employer systems.',
    nodeIds: [
      'career-ai-systems',
      'system-enterprise-automation',
      'system-gateplane',
      'system-onesuite-infrastructure',
      'system-agentic-commerce',
      'evidence-technical-writing',
      'system-dg-os',
    ],
    edgeIds: [
      'career-ai-to-enterprise',
      'career-ai-to-gateplane',
      'career-ai-to-infrastructure',
      'career-ai-to-commerce',
      'commerce-to-writing',
      'writing-to-dgos',
    ],
  },
] as const;

export const networkConfig = {
  nodes: networkNodes,
  ideas: networkIdeaEdges,
  paths: networkPaths,
} as const;

export const networkLinks = {
  githubOrg: 'https://github.com/orgs/ai-knowledge-hub/repositories',
  githubPersonal: 'https://github.com/DG-creative-lab?tab=repositories',
  newsHub: 'https://ai-news-hub.performics-labs.com/analysis',
  skillsHub: 'https://skills.ai-knowledge-hub.org/',
} as const;

export default networkConfig;
