import type {
  ApplicationCaseStudy,
  ApplicationClaim,
  EvidenceLink,
  EvolutionEntry,
} from './contracts';

const links = {
  aiNewsHub: {
    label: 'Performics Labs AI News Hub',
    url: 'https://ai-news-hub.performics-labs.com/',
    kind: 'site',
  },
  aiNewsHubRepository: {
    label: 'AI News Hub repository',
    url: 'https://github.com/ai-knowledge-hub/performics_labs_ai_news',
    kind: 'repository',
  },
  aiSkillsPlatform: {
    label: 'AI Skills Platform',
    url: 'https://skills.ai-knowledge-hub.org/',
    kind: 'site',
  },
  aiSkillsRepository: {
    label: 'AI Skills Platform repository',
    url: 'https://github.com/ai-knowledge-hub/ai-skills-guide',
    kind: 'repository',
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
  humanSystemsPublicEvidence: {
    label: 'Public Human Systems components',
    url: 'https://github.com/DG-creative-lab',
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
  gateplane: {
    label: 'Gateplane product overview',
    url: 'https://gateplane-beta.vercel.app/overview',
    kind: 'site',
  },
} as const satisfies Record<string, EvidenceLink>;

export const applicationClaims: readonly ApplicationClaim[] = [
  {
    id: 'ai-news-platform',
    statement:
      'Built and maintains the open-source AI News Hub as a shared research platform for applied AI in marketing, connecting news, deep analysis, build sessions, and public prototypes.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-08-23',
    evidence: [links.aiNewsHub, links.aiNewsHubRepository],
    boundary:
      'The public site and repository verify the platform. Article bylines may represent collaborative newsroom work and do not establish sole authorship of every publication.',
  },
  {
    id: 'ai-news-community',
    statement:
      'Created the platform to support an internal community of thinkers, builders, and innovators that has grown to about 400 company members.',
    confidence: 'self-reported',
    visibility: 'collaborative-public',
    lastVerified: '2026-08-23',
    evidence: [links.aiNewsHub],
    boundary:
      'The community purpose and approximate membership are owner-reported. Public membership or engagement analytics were not available for independent verification.',
  },
  {
    id: 'ai-skills-platform',
    statement:
      'Built AI Skills Platform to turn applied AI research into reusable capabilities that practitioners can inspect, install, test, and adapt across agent runtimes.',
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-08-23',
    evidence: [links.aiSkillsPlatform, links.aiSkillsRepository],
    boundary:
      'The public catalog verifies package structure, tooling, and declared usability. Adoption and production impact require separate evidence.',
  },
  {
    id: 'human-systems-platform',
    statement:
      'I am developing Human Systems Platform as a founder-led product for people and organisations that need credible evidence of capability in AI-mediated work. It turns selected experience into private learning, owner-approved public evidence, and testable hypotheses about where that capability may create value.',
    confidence: 'self-reported',
    visibility: 'public',
    lastVerified: '2026-08-23',
    evidence: [links.humanSystemsPublicEvidence, links.learningFoundry, links.dgOs],
    boundary:
      'The shared product repository is private and the joined platform remains under development. Public component repositories support the direction, but product-market fit, beneficial outcomes, customer demand, and willingness to pay are not yet established.',
  },
  {
    id: 'agent-runtime',
    statement:
      'I built Agentic Commerce to help brands test and improve how they describe products for paid placements and organic agent-led discovery, without giving an AI system unchecked control over business actions.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-08-23',
    evidence: [links.agenticCommerce],
    boundary:
      'The repository is an active public engineering project. It does not claim guaranteed production ranking outcomes or production-scale Codex traffic.',
  },
  {
    id: 'feedback-loop',
    statement:
      'I designed a Bayesian-style learning loop that updates brand- and product-scoped beliefs as evidence arrives and carries supported patterns into later query and copy generation. It recommends whether to promote, revise, or reject each variant, while the supervised runtime keeps tools, evidence, memory, approvals, and recovery under explicit control.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-08-23',
    evidence: [links.agenticCommerce],
  },
  {
    id: 'codex-capability',
    statement:
      "I built Learning Foundry as a stand-alone learning product for people who want to learn with AI without treating an agent's successful output as proof of their own understanding. It helps them explain, test, apply, and revise what they learn while separately developing evaluated agent capabilities.",
    confidence: 'verified',
    visibility: 'submitted-public',
    lastVerified: '2026-08-22',
    evidence: [links.learningFoundry],
    boundary:
      'Learning Foundry is a submitted OpenAI Build Week project. Its repository remains unchanged while judging is active.',
  },
  {
    id: 'provider-runtime',
    statement:
      "I built DG-OS as a stand-alone public profile and discovery product where visitors can inspect a person's systems, evidence, writing, and development or ask questions grounded in reviewed public sources.",
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-08-22',
    evidence: [links.dgOs],
  },
  {
    id: 'gateplane-control-plane',
    statement:
      'I developed Gateplane independently to explore how authenticated human or agent identity becomes bounded, tenant-aware authority for tools and external effects.',
    confidence: 'self-reported',
    visibility: 'public',
    lastVerified: '2026-08-28',
    evidence: [links.gateplane],
    boundary:
      'The product overview is public and the source is private. Gateplane is an independent beta, not an employer deployment, and production adoption is not claimed. LLM orchestration, governed learning, and production proof of the optional sandbox path remain incomplete.',
  },
  {
    id: 'intent-ml',
    statement:
      'Implemented behavioural embeddings, unsupervised clustering, and grounded persona generation for intent analysis.',
    confidence: 'verified',
    visibility: 'collaborative-public',
    lastVerified: '2026-08-22',
    evidence: [links.intentRecognition, links.geometryArticle],
  },
  {
    id: 'production-agent-platform',
    statement:
      'I architect and build the Programmatic plugin and agent harness that turns ambiguous user requests into tenant-bound execution across skills, a typed CLI, backend services, analytical data, and advertising-platform APIs.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-08-28',
    evidence: [],
    boundary:
      'This is an owner-reported description of current employer work. Source code, client data, logs, infrastructure details, and operational measurements remain private.',
  },
  {
    id: 'production-data-platform',
    statement:
      'I build backend ingestion and serving workflows for heterogeneous advertising data across provider hierarchies and analytical grains, and evaluate storage architecture against query shape, aggregation, latency, reliability, and cost.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-08-28',
    evidence: [],
    boundary:
      'This is an owner-reported responsibility-level claim. Employer implementation details and measurements remain private, and active architecture proposals are not represented as deployed outcomes.',
  },
  {
    id: 'production-backend',
    statement:
      'I delivered backend services and cloud data workflows for an award-recognised ecommerce optimisation platform.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-08-28',
    evidence: [links.awardPlatform],
    boundary:
      'The public case study verifies the platform and award context. My detailed implementation contribution remains employer-confidential.',
  },
] as const;

export const applicationCaseStudies: readonly ApplicationCaseStudy[] = [
  {
    id: 'ai-news-hub',
    title: 'Performics Labs AI News Hub',
    classification: 'Open-source public platform developed in a professional innovation context',
    contribution:
      'Conceived, built, and maintains the Astro platform, editorial structure, publishing workflows, and research-to-prototype links.',
    problem:
      'Marketing teams face constant AI announcements but often lack a shared place to decide what changes their work and what they should build next.',
    intervention:
      'Created one public hub for fast news, deeper analysis, All-Hands build sessions, and projects that carry useful research into working code.',
    evaluation:
      'The reviewed public repository contains 43 news entries, 19 analyses, 6 All-Hands sessions, an MIT license, and 109 commits. The project owner reports about 400 internal company members.',
    result:
      'The platform gives practitioners, strategists, and engineers a common route from awareness to discussion, implementation choices, and public prototypes.',
    limitation:
      'Membership and engagement figures are owner-reported. Public bylines may represent collaborative newsroom work, so platform development is separate from authorship of every article.',
    roleSignals: [
      'product development',
      'applied AI research',
      'technical communication',
      'community platform',
      'Astro',
    ],
    evidence: [links.aiNewsHub, links.aiNewsHubRepository],
  },
  {
    id: 'ai-skills-platform',
    title: 'AI Skills Platform',
    classification: 'Open-source public catalog and installation platform',
    contribution:
      'Designed and built the catalog model, reusable packages, generated registries, install flows, web interface, validation rules, and QA conventions.',
    problem:
      'Articles can explain agent workflows, but practitioners still need reusable packages that state what they do, what they can access, and what must be approved.',
    intervention:
      'Turned several AI News Hub ideas into skills, agents, plugins, and tool connectors with manifests, examples, test prompts, usability labels, and cross-runtime installation support.',
    evaluation:
      'The reviewed public registry contains 42 skills, 7 agents, 8 tool or MCP entries, and 11 plugins, supported by 69 test-prompt suites and a public Next.js catalog.',
    result:
      'Readers can move from understanding an AI workflow to inspecting, installing, testing, and adapting a practical implementation.',
    limitation:
      'Registry inclusion verifies packaging and declared usability. Some entries require setup or implementation, and public adoption or production impact is not claimed.',
    roleSignals: [
      'capability design',
      'developer tooling',
      'agent operations',
      'cross-runtime packaging',
      'evaluation',
    ],
    evidence: [links.aiSkillsPlatform, links.aiSkillsRepository],
  },
  {
    id: 'agentic-commerce',
    title: 'Agentic Commerce',
    classification: 'Collaborative public engineering project · active development',
    contribution:
      'I designed the product, its Bayesian-style learning loop, the experiment system, and the supervised agent runtime.',
    problem:
      'Brands need to improve how products are described for paid placements and organic agent-led discovery. Isolated tests do not preserve what was learned or show whether a variant deserves to move forward.',
    intervention:
      'I built a learning loop that updates brand and product beliefs from synthetic and observed evidence, carries supported patterns into later query and copy generation, and recommends whether to promote, revise, or reject each variant. The supervised runtime controls tools, approvals, publication, and recovery.',
    evaluation:
      'I checked the learning loop and control plane with more than 280 automated tests spanning experiment decisions, evidence updates, runtime policy, replay, validation, recovery, credentials, and receipt integrity.',
    result:
      'The product can improve its recommendations over repeated cycles while keeping each evidence source, belief update, decision, and human approval inspectable.',
    limitation:
      'The project does not claim guaranteed production ranking outcomes. Observed validation coverage and real-world commercial impact still require further evidence.',
    roleSignals: [
      'product optimisation',
      'Bayesian learning',
      'feedback systems',
      'human control',
      'reliability and recovery',
    ],
    evidence: [links.agenticCommerce],
  },
  {
    id: 'gateplane-control-plane',
    title: 'Gateplane Agent Control Plane',
    classification: 'Independent deployed beta with private source and public product overview',
    contribution:
      'Designed the system boundary across identity, tenant scope, delegated authority, approvals, workspace materialisation, execution, evidence, and publication.',
    problem:
      'An LLM can propose useful work, but enterprise systems still need deterministic control over who may act, which resources they may reach, and which effects may leave the workspace.',
    intervention:
      'Separated control-plane identity from domain resources, then bound agent grants and one-time approvals to scope and parameters, isolated each run workspace, and required declared outputs before publication.',
    evaluation:
      'Architecture checks passed and the repository recorded 677 passing tests, 1 skipped test, and 25 database-backed tests blocked by an unavailable PostgreSQL host during the reviewed session.',
    result:
      'The current platform provides a substantial security and execution envelope that can host model-proposed work without giving the model deterministic authority.',
    limitation:
      'It is an independent beta rather than an employer-deployed system, and production adoption is not claimed. Provider invocation, context assembly, reasoning orchestration, governed memory, evaluation, and learning remain target architecture, while RLS coverage and sandbox production proof need further work.',
    roleSignals: [
      'systems engineering',
      'identity and authorisation',
      'agent execution',
      'authority boundaries',
      'failure analysis',
    ],
    evidence: [links.gateplane],
  },
  {
    id: 'human-systems-platform',
    title: 'Human Systems Platform',
    classification: 'Founder product in private active development',
    contribution:
      'Defined the product thesis, federated module boundaries, evidence and authority model, initial commercial application, validation questions, and the first executable publication workflow.',
    problem:
      'AI makes polished work and professional claims cheap to produce, but existing profiles, interviews, and learning records reveal little about how a person worked with AI, exercised judgement, learned from failure, or could transfer that capability into a different situation.',
    intervention:
      'Designed an owner-controlled product loop in which selected experience can become private learning, approved evidence, a bounded opportunity hypothesis, and a later outcome that corrects the next cycle.',
    evaluation:
      'The private working repository contains shared evidence contracts and tested adapters for owner review, exact approval, signing, protected local persistence, Dessi Space proposals, Learning Foundry evidence, and DG-OS publication preparation. The public Learning Foundry and DG-OS repositories provide inspectable component evidence.',
    result:
      'The current work establishes a credible technical and product foundation for connecting useful private learning with trustworthy public representation while preserving separate authority boundaries.',
    limitation:
      'The federation is not yet an integrated product. Receiver-observed publication, the complete outcome feedback loop, Organization Foundry, production signing, customer pilots, and commercial validation remain incomplete or planned.',
    roleSignals: [
      'founder product strategy',
      'systems engineering',
      'human-AI interaction',
      'evidence and authority design',
      'commercial validation',
    ],
    evidence: [links.humanSystemsPublicEvidence, links.learningFoundry, links.dgOs],
  },
  {
    id: 'learning-foundry',
    title: 'Learning Foundry',
    classification: 'OpenAI Build Week submission · frozen during judging',
    contribution:
      'Directed the product thesis and epistemic boundaries, then built the evidence ledger, deterministic projections, learning checks, capability lifecycle, and consent-gated Codex adapter.',
    problem:
      'People can use AI to produce an answer quickly, but the finished answer does not show what they understood, what the agent contributed, or whether either capability will survive a new situation.',
    intervention:
      'Created a learning environment for explanation, prediction, practice, application, and revision. Canonical sources, human understanding, shared theory, agent memory, and capability state remain separate, with approval required before agent activation.',
    evaluation:
      'A deterministic prepared adapter, an evaluated value-density capability, and regression tests cover provenance, state transitions, IPC boundaries, accessibility, and fallback behaviour.',
    result:
      'A learner can build and test understanding while separately improving an agent. Corrections can revise either path without silently rewriting the original evidence.',
    limitation:
      'The submitted prototype uses one bounded learning domain. Private persistence, broader longitudinal use, and full integration with Human Systems Platform remain under development.',
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
    title: 'DG-OS',
    classification: 'Personal public system · active',
    contribution:
      'Designed and built the public profile product, evidence contracts, system map, deterministic CV pipeline, Profile Agent, provider gateway, and publication verification boundary.',
    problem:
      'A static CV compresses a person into claims and dates. A generic portfolio chatbot adds fluent answers, but it can make those claims harder to inspect rather than more trustworthy.',
    intervention:
      'Built a navigable public model of systems, professional context, writing, evidence, and change. Direct exploration and source-grounded questions share the same reviewed public profile.',
    evaluation:
      'The repository contains more than 180 TypeScript test declarations covering routing, context, streaming, API contracts, provider health, fallback, and desktop state.',
    result:
      "Visitors can understand and verify Dessi's work through more than one route, while Dessi retains control over which evidence becomes part of the public representation.",
    limitation:
      'DG-OS is functional as a public profile product. Automated private-to-public ingestion, durable activation, rollback, and the later-outcome feedback loop remain under development in Human Systems Platform.',
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
  'Human Systems Platform is a founder product in private active development. Its components are functional at different levels, but the complete joined workflow and commercial demand are not yet proven.',
  'Current learning updates evidence, beliefs, memory, policy, and versioned harness configuration; it does not retrain a foundation model or permit silent self-modification.',
] as const;

export const evolutionEntries: readonly EvolutionEntry[] = [
  {
    date: '2026-08-28',
    kind: 'revision',
    title: 'Production and public evidence became separate proof planes',
    summary:
      'Employer work now demonstrates production agent, data, and multi-tenant constraints at a confidentiality-safe level, while independent systems provide inspectable evidence of the corresponding authority, evaluation, and recovery patterns.',
    state: 'reviewed',
    evidenceIds: [
      'production-agent-platform',
      'production-data-platform',
      'gateplane-control-plane',
      'agent-runtime',
    ],
  },
  {
    date: '2026-08-23',
    kind: 'revision',
    title: 'The founder product became the orienting system',
    summary:
      'Human Systems Platform now provides the product frame for Dessi Space, Learning Foundry, DG-OS, and the planned Organization Foundry. Each remains useful on its own while contributing to one owner-controlled evidence and learning loop.',
    state: 'reviewed',
    evidenceIds: ['human-systems-platform', 'codex-capability', 'provider-runtime'],
  },
  {
    date: '2026-08-23',
    kind: 'revision',
    title: 'Research and implementation platforms became first-class systems',
    summary:
      'The AI News Hub now appears as the shared research product, while AI Skills Platform appears as its practical capability layer for turning selected ideas into reusable packages.',
    state: 'reviewed',
    evidenceIds: ['ai-news-platform', 'ai-news-community', 'ai-skills-platform'],
  },
  {
    date: '2026-08-22',
    kind: 'revision',
    title: 'Current projects became one system map',
    summary:
      'Dessi Space, Learning Foundry, DG-OS, and the shared Human Systems Platform are now described as separate authority planes with explicit dependencies, maturity, and publication boundaries.',
    state: 'reviewed',
    evidenceIds: ['codex-capability', 'provider-runtime'],
  },
  {
    date: '2026-08-22',
    kind: 'observation',
    title: 'Models propose; validated systems decide',
    summary:
      'Across Gateplane and Agentic Commerce, improving intelligence remains inside deterministic controls for identity, permissions, evidence, state transitions, effects, and rollback.',
    state: 'observed',
    evidenceIds: ['gateplane-control-plane', 'agent-runtime', 'feedback-loop'],
  },
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
