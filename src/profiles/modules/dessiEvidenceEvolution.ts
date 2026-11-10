import type {
  ApplicationCaseStudy,
  ApplicationClaim,
  EvidenceLink,
  EvolutionEntry,
} from './contracts';

const links = {
  independentPublication: {
    label: 'AI Knowledge Hub library',
    url: 'https://ai-knowledge-hub.org/library/',
    kind: 'site',
  },
  aiHarness: {
    label: 'AI Knowledge Hub Harness repository',
    url: 'https://github.com/ai-knowledge-hub/ai-harness-lab',
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
  directAcquisition: {
    label: 'Direct Acquisition Agent repository',
    url: 'https://github.com/DG-creative-lab/direct-acquisition-agent',
    kind: 'repository',
  },
  youtubeAdAgent: {
    label: 'YouTube Ad Agent repository',
    url: 'https://github.com/DG-creative-lab/youtube-ad-agent',
    kind: 'repository',
  },
  agenticCommerce: {
    label: 'Agentic Commerce repository',
    url: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
    kind: 'repository',
  },
  learningFoundry: {
    label: 'Learning Foundry open-source repository',
    url: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry',
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
    url: 'https://ai-knowledge-hub.org/library/geometry-of-intention-llms-human-goals-marketing/',
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
    id: 'ai-knowledge-hub-publication',
    statement:
      'Dessi publishes AI Knowledge Hub, an independent publication covering AI in marketing, growth, and go-to-market, with reusable resources in Skills and engineering guides and interactive examples in Harness.',
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-11-10',
    evidence: [links.independentPublication, links.aiSkillsPlatform, links.aiHarness],
  },
  {
    id: 'direct-acquisition-agent',
    statement:
      'I built the Direct Acquisition Agent to prepare direct-mail experiments with source-grounded copy, randomised A/B and no-mail groups, and exact campaign approval. I am improving the checks that require complete, mature synthetic response cohorts before proposing the next test.',
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-11-10',
    evidence: [links.directAcquisition],
    boundary:
      'The local prototype uses synthetic businesses and responses and a simulated handoff. Its results describe those demonstration cohorts.',
  },
  {
    id: 'youtube-ad-agent',
    statement:
      'I built the YouTube Ad Agent to match video placements with relevant ads and demos. I am improving how it uses saved delivery reports and separately recorded viewer activity to propose a next test for buyer review.',
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-11-10',
    evidence: [links.youtubeAdAgent],
    boundary:
      'The prototype uses sample delivery, local viewer activity, and a separate paused Google Ads test-account workflow.',
  },
  {
    id: 'geometry-of-intention-authorship',
    statement: 'Dessi Georgieva wrote The Geometry of Intention, available on AI Knowledge Hub.',
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-11-10',
    evidence: [links.geometryArticle],
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
      'I am developing Human Systems Platform for AI-augmented career and capability development. It turns selected human-AI work into private learning and evidence, helps individuals explore jobs, collaborators, funding, markets, and next capabilities, and helps organisations discover relevant talent through owner-approved public profiles.',
    confidence: 'self-reported',
    visibility: 'public',
    lastVerified: '2026-09-05',
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
      "I built Learning Foundry as an open-source learning product for people who want to learn with AI without treating an agent's successful output as proof of their own understanding. It helps them explain, test, apply, and revise what they learn while separately developing evaluated agent capabilities.",
    confidence: 'verified',
    visibility: 'public',
    lastVerified: '2026-09-05',
    evidence: [links.learningFoundry],
    boundary:
      "The MIT-licensed public implementation began as an OpenAI Build Week submission. The product now continues as Human Systems Platform's general learning and capability-development module; longitudinal outcomes and full integration remain unproven.",
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
      'I architected and evolved a production Programmatic agent platform used by internal agency teams across three major global advertiser accounts, taking it from prototype through changing engineering and user requirements.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-09-21',
    evidence: [],
    boundary:
      'This is an owner-reported description of Dessi’s work at Publicis Media. Source code, client data, logs, infrastructure details, and operational measurements remain private.',
  },
  {
    id: 'production-agent-runtime',
    statement:
      'I designed its provider-neutral CLI grammar and orchestration across Claude Agent SDK on AWS Bedrock AgentCore, Lambda services, analytical data, and hierarchical DV360 and TTD APIs, while deterministic controls retain tenant scope, evidence, approvals, and provider writes.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-09-21',
    evidence: [],
    boundary:
      'This is a responsibility-level description of a private employer system. Provider credentials, tenant mappings, client configuration, and runtime records remain confidential.',
  },
  {
    id: 'production-onboarding',
    statement:
      'I built configuration-driven advertiser onboarding and ingestion workflows that replace spreadsheet-led enablement and remove at least three days of cross-team coordination from each onboarding cycle.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-09-21',
    evidence: [],
    boundary:
      'The workflow and time reduction are owner-reported. Client identities, onboarding records, credentials, and internal operational evidence remain private.',
  },
  {
    id: 'production-evaluation',
    statement:
      'I designed routing and correctness evaluations for the agent; the production platform combines those checks with AgentCore traces, CloudWatch, PostHog, and automated measures for tool use, grounding, latency, and cost.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-09-21',
    evidence: [],
    boundary:
      'Evaluation datasets, traces, thresholds, results, and production measurements are employer-confidential. The claim is limited to design responsibility and the implemented evaluation surface.',
  },
  {
    id: 'production-playbooks',
    statement:
      'I translated agency-user requirements into tenant-scoped CLI workflows for creating, persisting, versioning, and sharing campaign playbooks that users can maintain as their operating practice changes.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-09-21',
    evidence: [],
    boundary:
      'This describes the reusable product capability without exposing customer playbook content, tenant configuration, or private implementation details.',
  },
  {
    id: 'production-data-platform',
    statement:
      'I built ingestion connectors and bronze, silver, and gold Databricks ELT pipelines for advertising datasets that could reach millions of records. I designed the production S3 landing layer, read-only staging access, and schema-based development reads using test data.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-11-10',
    evidence: [],
    boundary:
      'The S3 and environment access model describes design responsibility. Bucket identifiers, access configurations, and production rollout details remain private.',
  },
  {
    id: 'production-data-serving',
    statement:
      'I built Databricks-backed serving APIs and typed CLI routing between warehouse reports and live advertising APIs. I added schema, freshness, and completeness checks and reconciled serving results to source totals.',
    confidence: 'self-reported',
    visibility: 'private-employer',
    lastVerified: '2026-11-10',
    evidence: [],
    boundary:
      'This describes implementation scope. Employer code, customer data, performance measurements, and rollout details remain private.',
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
    id: 'direct-acquisition-agent',
    title: 'Direct Acquisition Agent',
    classification: 'Independent prototype · Active development',
    contribution:
      'Built a direct-mail acquisition agent that turns a brief and a specified audience into a campaign that a person can review.',
    problem:
      'A new campaign needs a defined audience, a copy test, and a comparison group so later responses can inform the next decision.',
    intervention:
      'Randomised eligible businesses into A/B and no-mail groups, grounded copy in approved product facts, and bound approval to the exact audience, budget, and draft.',
    evaluation:
      'Local tests exercise report ingestion, incomplete cohorts, and approval checks. Only complete, mature synthetic response cohorts contribute to the comparison.',
    result:
      'The prototype prepares a campaign for simulated handoff and uses counted responses to propose the next experiment.',
    limitation:
      'Evidence comes from synthetic audiences and responses in a local demonstration. Delivery is simulated.',
    roleSignals: ['marketing agents', 'experiment design', 'data quality', 'human approval'],
    evidence: [links.directAcquisition],
  },
  {
    id: 'youtube-ad-agent',
    title: 'YouTube Ad Agent',
    classification: 'Independent prototype · Active development',
    contribution:
      'Built a campaign-planning agent that links YouTube placement research, creative selection, and post-click product demos.',
    problem:
      'A buyer needs to see which ads ran, what viewers did after arriving, and which part of the campaign is worth testing next.',
    intervention:
      'Paired placements with ads and matching demos, kept reported delivery separate from tagged viewer activity, and used saved evidence to recommend a follow-up test.',
    evaluation:
      'The local workflow records arrivals and completed comparisons. A separate Google Ads test-account path validates and reads back a paused setup.',
    result:
      'The planner proposes a next test for buyer review, with the report, viewer observations, and buyer corrections available for inspection.',
    limitation:
      'Evidence is limited to sample delivery, local viewer activity, and test-account checks.',
    roleSignals: ['marketing agents', 'contextual advertising', 'measurement', 'human approval'],
    evidence: [links.youtubeAdAgent],
  },
  {
    id: 'ai-skills-platform',
    title: 'AI Knowledge Hub Skills',
    classification: 'Open-source public catalog and installation platform',
    contribution:
      'Designed and built the catalog model, reusable packages, generated registries, install flows, web interface, validation rules, and QA conventions.',
    problem:
      'Articles can explain agent workflows, but practitioners still need reusable packages that state what they do, what they can access, and what must be approved.',
    intervention:
      'Turned selected published ideas into skills, agents, plugins, and tool connectors with manifests, examples, test prompts, usability labels, and cross-runtime installation support.',
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
      'Defined the product thesis, federated module boundaries, evidence and authority model, initial commercial application, opportunity-research surface, validation questions, and the first executable publication workflow.',
    problem:
      'AI makes polished work and professional claims cheap to produce, but existing profiles, interviews, and learning records reveal little about how a person worked with AI, exercised judgement, learned from failure, or could transfer that capability into a different situation.',
    intervention:
      'Designed an owner-controlled product loop in which selected experience can become private learning, approved evidence, a bounded opportunity hypothesis, and a later outcome that corrects the next cycle.',
    evaluation:
      'The private working repository contains shared evidence contracts and tested adapters for owner review, exact approval, signing, protected local persistence, Dessi Space proposals, Learning Foundry evidence, DG-OS publication preparation, and a deterministic Opportunity Studio preview. The public Learning Foundry and DG-OS repositories provide inspectable component evidence.',
    result:
      'The current work establishes a credible technical and product foundation for connecting useful private learning with trustworthy public representation while preserving separate authority boundaries.',
    limitation:
      'The federation is not yet an integrated product. Opportunity research is manually invoked, and receiver-observed publication, the complete outcome feedback loop, Organization Foundry, customer pilots, and commercial validation remain incomplete or planned.',
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
    classification: 'MIT-licensed learning product · active product direction',
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
      'The public implementation began with one bounded Build Week learning domain. Private persistence, broader longitudinal use, and full integration with Human Systems Platform remain under development.',
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
    date: '2026-11-10',
    kind: 'question',
    title:
      'What can the Direct Acquisition Agent and YouTube Ad Agent learn from marketing campaign evidence?',
    summary:
      'Dessi is improving how the Direct Acquisition Agent checks synthetic report completeness before learning, and how the YouTube Ad Agent combines saved delivery reports and local viewer activity to propose the next test. Both projects are independent marketing agents in active development, with human review before campaign changes.',
    state: 'active',
    evidenceIds: ['direct-acquisition-agent', 'youtube-ad-agent'],
  },
  {
    date: '2026-11-10',
    kind: 'revision',
    title: 'Data engineering and agent data access',
    summary:
      'The profile records the ingestion and transformation work behind the programmatic agent, including the S3 environment design, Databricks pipelines and serving APIs, and checks for data quality.',
    state: 'reviewed',
    evidenceIds: ['production-data-platform', 'production-data-serving'],
  },
  {
    date: '2026-11-10',
    kind: 'revision',
    title: 'Dessi’s independent publication and research library',
    summary:
      'Dessi publishes her research, essays, and practical guides independently at AI Knowledge Hub. The library includes revised editions of her earlier work alongside new writing.',
    state: 'reviewed',
    evidenceIds: ['ai-knowledge-hub-publication', 'geometry-of-intention-authorship'],
  },
  {
    date: '2026-09-21',
    kind: 'revision',
    title: 'Enterprise delivery evidence became explicit',
    summary:
      'The profile now records the production Programmatic lifecycle from agency requirements and rapid prototyping through AgentCore delivery, evaluation, advertiser onboarding, user-owned playbooks, and operational recovery without exposing client identities or private implementation data.',
    state: 'reviewed',
    evidenceIds: [
      'production-agent-platform',
      'production-agent-runtime',
      'production-onboarding',
      'production-evaluation',
      'production-playbooks',
      'production-data-platform',
    ],
  },
  {
    date: '2026-09-05',
    kind: 'revision',
    title: 'Opportunity research completed the personal product loop',
    summary:
      "Opportunity Studio now connects an explicitly disclosed profile and project snapshot to bounded, cited opportunity and market research. Its first dogfood run exposed the need to resolve a person's full project portfolio before designing a market mission.",
    state: 'active',
    evidenceIds: ['human-systems-platform'],
  },
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
      'Human Systems Platform now provides the product frame for Dessi Space, Learning Foundry, Opportunity Studio, DG-OS, and the planned Organization Foundry. Each remains useful on its own while contributing to one owner-controlled evidence, learning, research, and feedback loop.',
    state: 'reviewed',
    evidenceIds: ['human-systems-platform', 'codex-capability', 'provider-runtime'],
  },
  {
    date: '2026-08-23',
    kind: 'revision',
    title: 'Research became reusable through Skills',
    summary:
      'AI Knowledge Hub Skills turns selected research ideas into packages that practitioners can inspect, install, and test.',
    state: 'reviewed',
    evidenceIds: ['ai-skills-platform'],
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
