export type EvidenceConfidence = 'verified' | 'self-reported' | 'inferred';
export type EvidenceVisibility =
  | 'public'
  | 'collaborative-public'
  | 'private-employer'
  | 'submitted-public';

export type EvidenceLink = {
  label: string;
  url: string;
  kind: 'repository' | 'article' | 'site' | 'role';
};

export type ApplicationClaim = {
  id: string;
  statement: string;
  confidence: EvidenceConfidence;
  visibility: EvidenceVisibility;
  lastVerified: string;
  evidence: readonly EvidenceLink[];
  boundary?: string;
};

export type ApplicationCaseStudy = {
  id: string;
  title: string;
  classification: string;
  contribution: string;
  problem: string;
  intervention: string;
  evaluation: string;
  result: string;
  limitation: string;
  roleSignals: readonly string[];
  evidence: readonly EvidenceLink[];
};

export type EvolutionEntry = {
  date: string;
  kind: 'observation' | 'question' | 'experiment' | 'revision';
  title: string;
  summary: string;
  state: 'observed' | 'active' | 'reviewed';
  evidenceIds: readonly string[];
};

const links = {
  openAiRole: {
    label: 'OpenAI role',
    url: 'https://openai.com/careers/applied-ai-engineer-codex-core-agent-san-francisco/',
    kind: 'role',
  },
  agenticCommerce: {
    label: 'Agentic Commerce repository',
    url: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
    kind: 'repository',
  },
  learningFoundry: {
    label: 'Learning Foundry submitted repository',
    url: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry/tree/0547da02518f432fdd85e79d317e1fedaa51c4c1',
    kind: 'repository',
  },
  dgOs: {
    label: 'DG-OS repository',
    url: 'https://github.com/DG-creative-lab/dg-labs-os',
    kind: 'repository',
  },
  intentRecognition: {
    label: 'Intent Recognition repository',
    url: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
    kind: 'repository',
  },
  geometryArticle: {
    label: 'The Geometry of Intention',
    url: 'https://ai-news-hub.performics-labs.com/analysis/geometry-of-intention-llms-human-goals-marketing',
    kind: 'article',
  },
  awardPlatform: {
    label: 'Public award case study',
    url: 'https://www.performancemarketingworldawards.com/finalists/unifying-retail-data-with-publicis-warehouse-7y3bxeifqg035ne',
    kind: 'article',
  },
} as const satisfies Record<string, EvidenceLink>;

export const applicationClaims: readonly ApplicationClaim[] = [
  {
    id: 'agent-runtime',
    statement:
      'Designed a supervised agent runtime with registry-pinned tools, policy preflight, immutable events, recovery paths, and external-agent job receipts.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-07-26',
    evidence: [links.agenticCommerce],
    boundary:
      'The repository is an active public engineering project. It does not claim production-scale Codex traffic.',
  },
  {
    id: 'feedback-loop',
    statement:
      'Built a governed feedback loop that separates synthetic validation, observed outcomes, belief revision, and human approval.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-07-26',
    evidence: [links.agenticCommerce],
  },
  {
    id: 'codex-capability',
    statement:
      'Built an evaluated, approval-gated Codex capability backed by append-only evidence and deterministic projections.',
    confidence: 'verified',
    visibility: 'submitted-public',
    lastVerified: '2026-07-26',
    evidence: [links.learningFoundry],
    boundary:
      'Learning Foundry is a submitted OpenAI Build Week project. Its repository remains unchanged while judging is active.',
  },
  {
    id: 'provider-runtime',
    statement:
      'Built a retrieval-backed agent interface with multiple provider adapters, streaming contracts, health checks, and explicit fallback controls.',
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-07-26',
    evidence: [links.dgOs],
  },
  {
    id: 'intent-ml',
    statement:
      'Implemented behavioural embeddings, unsupervised clustering, and grounded persona generation for intent analysis.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-07-26',
    evidence: [links.intentRecognition, links.geometryArticle],
  },
  {
    id: 'production-backend',
    statement:
      'Delivered FastAPI services and AWS data workflows for an award-recognised ecommerce optimisation platform.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-07-26',
    evidence: [links.awardPlatform],
    boundary:
      'The public case study verifies the platform and award context; Dessi’s detailed implementation contribution remains employer-confidential.',
  },
] as const;

export const applicationCaseStudies: readonly ApplicationCaseStudy[] = [
  {
    id: 'agentic-commerce',
    title: 'Agentic Commerce Control Plane',
    classification: 'Collaborative public engineering project · active development',
    contribution:
      'Designed and implemented the agent execution, policy, evidence, experiment, and operator-control layers across Python/FastAPI and TypeScript.',
    problem:
      'Long-running agent work becomes unsafe when plans, tool permissions, side effects, failures, and recovery are implicit.',
    intervention:
      'Introduced principal-aware runs, registry-pinned tools, effect classes, preflight checks, immutable receipts, idempotent jobs, and explicit approve, pause, retry, and recovery transitions.',
    evaluation:
      'The repository contains more than 280 Python test functions spanning runtime policy, API contracts, replay, validation, recovery, credentials, and receipt integrity.',
    result:
      'The system can explain what an agent plans, what it executed, why work failed, and which human decision is required next.',
    limitation:
      'This demonstrates architecture and regression discipline. It is not yet a benchmark of coding-agent solve rate, token cost, or production-scale latency.',
    roleSignals: [
      'tool-use strategy',
      'failure analysis',
      'feedback systems',
      'human control',
      'Python',
    ],
    evidence: [links.agenticCommerce],
  },
  {
    id: 'learning-foundry',
    title: 'Learning Foundry',
    classification: 'OpenAI Build Week submission · frozen during judging',
    contribution:
      'Directed the product thesis and epistemic boundaries, then built the evidence ledger, deterministic projections, learning checks, capability lifecycle, and consent-gated Codex adapter.',
    problem:
      'A model can produce work faster than a person can inspect the sources, assumptions, and revisions that shaped it.',
    intervention:
      'Separated canonical sources, human understanding, shared theory, agent memory, and capability state; required explicit approval before activation.',
    evaluation:
      'A deterministic prepared adapter, an evaluated value-density capability, and regression tests cover provenance, state transitions, IPC boundaries, accessibility, and fallback behaviour.',
    result:
      'A correction can challenge the human explanation, shared theory, and agent capability without silently rewriting the original evidence.',
    limitation:
      'The current evaluator is a bounded domain demonstration. It is not a broad code-generation benchmark.',
    roleSignals: [
      'Codex capabilities',
      'evaluation design',
      'context construction',
      'deterministic replay',
      'steerability',
    ],
    evidence: [links.learningFoundry],
  },
  {
    id: 'dg-os-runtime',
    title: 'DG-OS Agent Runtime',
    classification: 'Personal public system · active',
    contribution:
      'Built the provider gateway, deterministic command router, retrieval index, streaming client contracts, health diagnostics, and source-aware terminal experience.',
    problem:
      'A portfolio agent can easily become an ungrounded chat surface whose answers are difficult to verify or recover.',
    intervention:
      'Combined deterministic navigation with evidence retrieval, provider isolation, schema-checked API boundaries, health probes, and opt-in fallback behaviour.',
    evaluation:
      'The repository contains more than 180 TypeScript test declarations covering routing, context, streaming, API contracts, provider health, fallback, and desktop state.',
    result:
      'Visitors can navigate deterministically or ask grounded questions while retaining visibility into source and provider behaviour.',
    limitation:
      'The runtime is low-traffic and portfolio-scoped. It does not establish production-scale capacity or economic performance.',
    roleSignals: [
      'context construction',
      'provider reliability',
      'agent UX',
      'streaming',
      'regression testing',
    ],
    evidence: [links.dgOs],
  },
] as const;

export const currentBoundaries = [
  'No public coding-task solve-rate benchmark yet.',
  'No claim of model fine-tuning experience.',
  'No public production measurements for token cost, latency, or capacity.',
  'Employer systems are described at outcome level; private code, logs, clients, and infrastructure remain private.',
] as const;

export const evolutionEntries: readonly EvolutionEntry[] = [
  {
    date: '2026-07-26',
    kind: 'revision',
    title: 'Claims became typed evidence',
    summary:
      'DG-OS replaced inherited profile content and broad self-description with claims that carry visibility, confidence, provenance, and an explicit boundary.',
    state: 'reviewed',
    evidenceIds: ['agent-runtime', 'feedback-loop', 'codex-capability', 'provider-runtime'],
  },
  {
    date: '2026-07-26',
    kind: 'observation',
    title: 'Reliability is a product surface',
    summary:
      'Across Agentic Commerce, Learning Foundry, and DG-OS, the recurring work is making agent plans, evidence, failures, and human decisions inspectable.',
    state: 'observed',
    evidenceIds: ['agent-runtime', 'codex-capability', 'provider-runtime'],
  },
  {
    date: '2026-07-26',
    kind: 'question',
    title: 'Can reliability become measurable across real coding tasks?',
    summary:
      'The next research step is a reproducible task suite that records solve rate, regression, latency, token use, failure class, and intervention effect.',
    state: 'active',
    evidenceIds: ['agent-runtime', 'provider-runtime'],
  },
  {
    date: '2026-07-26',
    kind: 'experiment',
    title: 'Private evidence, deliberate publication',
    summary:
      'Dessi Space now observes approved repositories read-only and records private review events. Public DG-OS receives only separately approved projections.',
    state: 'active',
    evidenceIds: ['provider-runtime'],
  },
] as const;

export const openAiCodexApplication = {
  role: 'Applied AI Engineer, Codex Core Agent',
  location: 'London, UK',
  roleUrl: links.openAiRole.url,
  heading: 'I build the layer where agent capability becomes accountable behaviour.',
  introduction:
    'My work sits between models and use: tool execution, context, evidence, failure recovery, human control, and the feedback loops that make the next run better.',
  applicationCv: {
    pdf: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.pdf',
    docx: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.docx',
    markdown: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.md',
  },
} as const;
