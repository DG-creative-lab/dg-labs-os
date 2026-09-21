import type { WorkbenchCategory, WorkbenchItem } from './contracts';

export const workbenchCategories = [
  'Selected Systems',
  'Professional Context',
] as const satisfies readonly WorkbenchCategory[];

export const workbenchCategoryDescriptions = {
  'Selected Systems': 'Public code and live systems that can be inspected directly.',
  'Professional Context': 'Production experience described within employer and client boundaries.',
} as const satisfies Readonly<Record<WorkbenchCategory, string>>;

export const workbench: readonly WorkbenchItem[] = [
  {
    id: 'ai-news-hub',
    category: 'Selected Systems',
    classification: 'Open-source public platform · Active',
    title: 'Performics Labs AI News Hub',
    subtitle: 'A shared research platform for applied AI in marketing',
    summary:
      'An applied AI research and publishing platform that helps marketing teams understand what new models, interfaces, and agent systems change in practice.',
    stack: ['Astro', 'React', 'TypeScript', 'MDX', 'Vercel', 'Editorial workflows'],
    links: {
      site: 'https://ai-news-hub.performics-labs.com/',
      repo: 'https://github.com/ai-knowledge-hub/performics_labs_ai_news',
    },
    highlights: [
      'Created as a shared home for an internal community of thinkers, builders, and innovators, with about 400 company members reported by the project owner.',
      'Connects fast news, deeper analysis, All-Hands build sessions, and working prototypes so research can lead to implementation.',
      'The public repository contains the MIT-licensed Astro application and the editorial system behind the live site.',
      'The site and code are public. Internal membership and engagement figures are owner-reported, and public bylines may represent collaborative work.',
    ],
  },
  {
    id: 'ai-skills-platform',
    category: 'Selected Systems',
    classification: 'Open-source public platform · Active',
    title: 'AI Skills Platform',
    subtitle: 'From AI research to reusable working capabilities',
    summary:
      'An open catalog that turns AI research into reusable skills, agents, plugins, and tool connectors for marketing, engineering, security, and agent operations.',
    stack: ['Go', 'Next.js', 'TypeScript', 'Markdown', 'JSON registries', 'Playwright'],
    links: {
      site: 'https://skills.ai-knowledge-hub.org/',
      repo: 'https://github.com/ai-knowledge-hub/ai-skills-guide',
      article:
        'https://ai-news-hub.performics-labs.com/news/agent-architect-playbook-building-ai-skills-marketing-adtech',
    },
    highlights: [
      'Developed as the practical companion to several AI News Hub articles, giving readers working packages they can inspect, install, test, and adapt.',
      'Uses versioned registries and manifests to show readiness, usability, authentication, permissions, and approval boundaries before adoption.',
      'The reviewed public registry contains 42 skills, 7 agents, 8 tool or MCP entries, and 11 plugins.',
      'The catalog verifies package structure and usability. Adoption and production impact require separate evidence.',
    ],
  },
  {
    id: 'ai-harness-lab',
    category: 'Selected Systems',
    classification: 'Open-source public learning lab · Selective development',
    title: 'AI Harness Lab',
    subtitle: 'Interactive patterns for reliable AI in marketing systems',
    summary:
      'A practical learning environment that shows how context, deterministic structures, tools, permissions, orchestration, and feedback shape the behaviour of marketing AI systems.',
    stack: [
      'Interactive systems manual',
      'Control patterns',
      'Algorithm visualisation',
      'Applied AI',
    ],
    links: {
      site: 'https://harness.ai-knowledge-hub.org/',
      repo: 'https://github.com/ai-knowledge-hub/ai-harness-lab',
      article:
        'https://ai-news-hub.performics-labs.com/analysis/deterministic-core-algorithms-data-structures-marketing-agents',
    },
    highlights: [
      'Created to move readers from AI News analysis into practical examples they can inspect and explore.',
      'Uses marketing workflows to explain the deterministic structures that support retrieval, routing, ordering, deduplication, memory, permissions, and control.',
      'Includes an interactive algorithms module and an agent control-plane pattern for identity, policy, approval, and audit.',
      'The public lab is functional, but its broader patterns and case-study library remain incomplete and development is selective.',
    ],
  },
  {
    id: 'agentic-commerce-loop',
    category: 'Selected Systems',
    classification: 'Collaborative public system · Active',
    title: 'Agentic Commerce Learning Loop',
    subtitle: 'Learning which product messages deserve to move forward',
    summary:
      'A supervised commerce product that helps brands improve product-message variants for paid placements and organic agent-led discovery, then carries stronger evidence into the next recommendation.',
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
      'Uses Bayesian-style learning to update client-, brand-, and product-scoped beliefs as new synthetic or observed evidence arrives.',
      'Turns each posterior update into a clear decision to promote, revise, or reject a product-message variant.',
      'Reuses well-supported patterns in later query and copy generation instead of silently retraining a foundation model.',
      'Keeps tools, evidence, memory, approvals, publication, and recovery under explicit control.',
    ],
  },
  {
    id: 'human-systems-platform',
    category: 'Selected Systems',
    classification: 'Founder product · Private platform development',
    title: 'Human Systems Platform',
    subtitle:
      'AI-augmented career development, evidence-backed talent discovery, and opportunity research',
    summary:
      'An owner-controlled product that helps people develop capability through human-AI work, demonstrate it through evidence, and explore jobs, collaborators, funding, and markets. It also gives organisations a stronger way to discover relevant talent. Owner-approved profiles create a public interface for human and agent discovery without turning evidence into an automated employment decision.',
    stack: [
      'Federated product',
      'Evidence contracts',
      'Owner review',
      'Opportunity intelligence',
      'Protected publication',
      'Outcome feedback',
    ],
    links: {
      site: 'https://dg-os.com/',
    },
    highlights: [
      'Responds to a growing trust problem: polished output is easy to generate, while CVs, interviews, and course completion reveal little about how someone worked with AI, detected failure, or transferred learning into practice.',
      'Dessi Space preserves private continuity; Learning Foundry develops human and agent capability; Opportunity Studio researches where it may create value; DG-OS publishes approved evidence; Organization Foundry will describe organisational demand.',
      'The product combines exploitation and exploration: it connects evidenced current capability to talent demand while researching adjacent roles, collaborators, funding, markets, and capabilities the person could develop. Opportunity Studio validates approved missions and returns cited hypotheses with visible coverage; it cannot act for the owner.',
      'Learning Foundry (MIT) and DG-OS (AGPL-3.0-only) are open source and adaptable. Human Systems Platform, Dessi Space, and Opportunity Studio remain private, keeping personal evidence outside public code.',
    ],
  },
  {
    id: 'dessi-space',
    category: 'Selected Systems',
    classification: 'Private local product · Active development',
    title: 'Dessi Space',
    subtitle: 'The first Personal Space deployment for private continuity and owner control',
    summary:
      'A local system that preserves selected work and learning context, provenance, reflection, and review decisions. Dessi Space is the first personal deployment of a reusable module: its purpose is to give an evidence owner continuity and control before any record enters learning, research, or publication workflows.',
    stack: ['Node.js', 'Local-first', 'Append-only evidence', 'Owner review', 'Privacy policy'],
    links: {},
    highlights: [
      'Observes only approved sources and records bounded evidence without turning a private workspace into continuous surveillance.',
      'Keeps reflection private and prepares reviewable candidate projections without publication authority.',
      'Contributes selected, provenance-bearing observations to Human Systems Platform while its private ledger remains canonical inside Dessi Space.',
      'The current Dessi instance proves the first-review boundary; the broader Personal Space product, durable records, and complete feedback loop remain under development.',
    ],
  },
  {
    id: 'learning-foundry',
    category: 'Selected Systems',
    classification: 'Open-source learning system · Active product direction',
    title: 'Learning Foundry',
    subtitle: 'A learning product for people working with AI agents',
    summary:
      'A learning product that helps a person turn source material and practical work into understanding they can explain, test, apply, and revise. It develops agent capabilities alongside human learning without treating them as the same achievement.',
    stack: ['TypeScript', 'React', 'Codex', 'Evidence ledger', 'Deterministic projections'],
    links: {
      repo: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry',
    },
    highlights: [
      'Creates independent value as a place to learn from approved sources, practise ideas, test transfer into a new situation, and revise understanding when evidence changes.',
      'Keeps human understanding, agent memory, shared theory, and evaluated agent capabilities separate, so an agent succeeding cannot be presented as proof that the person understands the task.',
      'Within Human Systems Platform, I use Learning Foundry to develop human understanding and separately governed agent capabilities while keeping the private learning ledger inside its own boundary.',
      "The MIT-licensed public implementation began as an OpenAI Build Week submission. Learning Foundry now continues as the platform's general learning and capability-development module; longitudinal evidence and full integration remain under development.",
    ],
  },
  {
    id: 'opportunity-studio',
    category: 'Selected Systems',
    classification: 'Private research module · Preview implemented',
    title: 'Opportunity Studio',
    subtitle: 'Owner-controlled opportunity and market intelligence',
    summary:
      'A Personal Space research surface that starts from an explicitly disclosed profile and project snapshot, then investigates direct, adjacent, developmental, and exploratory possibilities across work, collaboration, founder programmes, investment, and product markets.',
    stack: [
      'Research missions',
      'Cited observations',
      'Scope validation',
      'Coverage reports',
      'Owner decisions',
    ],
    links: {},
    highlights: [
      'The current E05-B1 preview validates the approved mission and disclosed profile before accepting provider-neutral research output.',
      'It separates source observations from candidate and market hypotheses, carries contradictions and unknowns, and reports freshness, scope, budgets, and incomplete coverage.',
      'The first dogfood research exposed a mission-design gap: project and product context must be resolved before market research begins, rather than inferred from a narrow profile summary.',
      'It cannot promise exhaustive coverage or act externally. Applications, contact, introductions, investment, spending, publication, and employment decisions remain with the owner or a human reviewer.',
    ],
  },
  {
    id: 'dg-os',
    category: 'Selected Systems',
    classification: 'Open-source public system · Active',
    title: 'DG-OS',
    subtitle: 'Owner-approved public evidence and professional discovery',
    summary:
      'A living professional profile that helps people and agents understand how someone works, what evidence supports each claim, and where the limits remain. It is also the public expression and discovery product within Human Systems Platform.',
    stack: ['Astro', 'React', 'TypeScript', 'Retrieval', 'Provider gateway', 'Streaming'],
    links: {
      repo: 'https://github.com/DG-creative-lab/dg-labs-os',
      site: 'https://dg-os.com/',
    },
    highlights: [
      'Creates independent value as a richer alternative to a static CV or portfolio, with navigable systems, evidence, writing, development history, and a source-grounded Profile Agent.',
      'Receives only material the owner has chosen and approved for publication. Private experience and learning remain in their original products.',
      'Within Human Systems Platform, DG-OS is the reusable external expression and discovery module. My profile is its first live public instance, rather than the limit of the product model.',
      'The AGPL-3.0-only software can be inspected and adapted while profile content and private evidence remain separately owned. Automated ingestion, durable version activation, and the complete feedback path remain under development.',
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
    classification: 'Independent deployed beta · Private source',
    title: 'Gateplane Agent Control Plane',
    subtitle: 'Identity, authority, and execution control for enterprise agent systems',
    summary:
      'An independently developed, provider-independent identity, authorisation, governance, and agent-execution control plane for hosted and embedded systems.',
    stack: ['Next.js', 'FastAPI', 'Microsoft Entra SSO', 'OIDC', 'Postgres', 'RBAC'],
    links: {
      site: 'https://gateplane-beta.vercel.app/overview',
    },
    highlights: [
      'Separates identity and control-plane data from tenant-scoped workspace resources.',
      'It ties access and approvals to the exact task, then checks tools and publication before work can leave an isolated workspace.',
      'Uses isolated run workspaces, declared outputs, and deterministic gates around model-proposed work.',
      'The product overview is public; source code and provisioned access remain private, and employer deployment or production adoption is not claimed.',
    ],
  },
  {
    id: 'enterprise-multi-tenant-platform',
    category: 'Professional Context',
    classification: 'Employer system · Outcome-level description',
    title: 'Production Programmatic Agent Platform',
    subtitle: 'Forward-deployed agent architecture for agency teams and advertiser accounts',
    summary:
      'A production agent platform developed with internal agency teams, connecting user intent, tenant-aware policy, programmatic provider APIs, analytical data, evaluation, and cloud delivery.',
    stack: [
      'AWS Bedrock AgentCore',
      'Claude Agent SDK',
      'AWS Lambda',
      'Databricks',
      'GitHub Actions',
      'CloudWatch',
      'PostHog',
      'DV360 and TTD',
    ],
    links: {},
    highlights: [
      'Evolved from a prototype into a production system used by internal agency teams across three major global advertiser accounts.',
      'Maps ambiguous intent through agent skills and a provider-neutral CLI grammar into Lambda services, analytical data, and hierarchical DV360 and TTD APIs.',
      'Keeps tenant scope, provider authorisation, evidence, write gates, human approval, and recovery deterministic while the model interprets requests and explains results.',
      'Automates advertiser onboarding and ingestion, replacing spreadsheet exchange and removing at least three days of cross-team coordination per onboarding cycle.',
      'Measures routing and correctness alongside tool use, grounding, latency, and cost, with AgentCore traces, CloudWatch, and PostHog supporting diagnosis.',
      'Turns agency feedback into reusable product capabilities, including tenant-scoped, persistent, versioned, and shareable campaign playbooks.',
      'Development deployments exposed AgentCore version-headroom limits; the team restored delivery, then added runtime rotation and headroom checks to prevent recurrence.',
      'Only responsibility, architecture, and sanitised outcome scope are public; employer code, customer identities, traces, measurements, and infrastructure details remain private.',
    ],
  },
] as const;
