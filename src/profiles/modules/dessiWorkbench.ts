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
    classification: 'Founder product · Private development',
    title: 'Human Systems Platform',
    subtitle: 'Owner-controlled evidence and learning for human-AI work',
    summary:
      'A founder-led platform for people and organisations that need a more credible way to develop and assess capability in AI-mediated work. It turns selected experience into private learning, owner-approved evidence, and challengeable hypotheses about where that capability can create value.',
    stack: [
      'Federated product',
      'Evidence contracts',
      'Owner review',
      'Protected publication',
      'Outcome feedback',
    ],
    links: {
      site: 'https://dg-os.com/',
    },
    highlights: [
      'Responds to a growing trust problem: polished output is easy to generate, while CVs, interviews, and course completion reveal little about how someone worked with AI, detected failure, or transferred learning into practice.',
      'Connects private experience, learning, approved evidence, opportunity, and later outcomes without turning a person into a score or making private activity available to employers.',
      'I designed it to bring together Dessi Space for private continuity, Learning Foundry for human and agent development, DG-OS for public profiles and discovery, and a planned Organization Foundry for the context organisations need.',
      'The first commercial hypothesis is evidence-backed talent discovery and capability development for AI-native technical work. The product remains under development, and customer demand, review burden, and willingness to pay still require pilots.',
    ],
  },
  {
    id: 'learning-foundry',
    category: 'Selected Systems',
    classification: 'Submitted public system · Judging state preserved',
    title: 'Learning Foundry',
    subtitle: 'A learning product for people working with AI agents',
    summary:
      'A learning product that helps a person turn source material and practical work into understanding they can explain, test, apply, and revise. It develops agent capabilities alongside human learning without treating them as the same achievement.',
    stack: ['TypeScript', 'React', 'Codex', 'Evidence ledger', 'Deterministic projections'],
    links: {
      repo: 'https://github.com/DG-creative-lab/codex-hack-learning-foundry/tree/0547da02518f432fdd85e79d317e1fedaa51c4c1',
    },
    highlights: [
      'Creates independent value as a place to learn from approved sources, practise ideas, test transfer into a new situation, and revise understanding when evidence changes.',
      'Keeps human understanding, agent memory, shared theory, and evaluated agent capabilities separate, so an agent succeeding cannot be presented as proof that the person understands the task.',
      'Within Human Systems Platform, I use Learning Foundry to develop human understanding and separately governed agent capabilities while keeping the private learning ledger inside its own boundary.',
      'The linked commit preserves the submitted OpenAI Build Week prototype. The broader product and platform integration remain under development.',
    ],
  },
  {
    id: 'dg-os',
    category: 'Selected Systems',
    classification: 'Personal public system · Active',
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
      'Within Human Systems Platform, I use DG-OS to publish owner-approved profiles for discovery. My profile is the first live public instance.',
      'The public product is functional today. Automated ingestion, durable version activation, and the complete feedback path from later outcomes remain under development.',
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
    subtitle: 'Identity, authority, and execution control for enterprise agent systems',
    summary:
      'A provider-independent identity, authorisation, governance, and agent-execution control plane for hosted and embedded systems.',
    stack: ['Next.js', 'FastAPI', 'Microsoft Entra SSO', 'OIDC', 'Postgres', 'RBAC'],
    links: {
      site: 'https://gateplane-beta.vercel.app/overview',
    },
    highlights: [
      'Separates identity and control-plane data from tenant-scoped workspace resources.',
      'It ties access and approvals to the exact task, then checks tools and publication before work can leave an isolated workspace.',
      'Uses isolated run workspaces, declared outputs, and deterministic gates around model-proposed work.',
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
      'Professional production experience connecting tenant-aware data, authenticated agent workflows, programmatic tools, and campaign optimisation.',
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
      'Builds a Programmatic plugin across agent skills, a typed CLI, backend tools, execution policy, human approval, and recovery.',
      'Keeps provider authorisation and write gates deterministic while the model interprets requests and explains results.',
      'Only architectural scope is described; employer code and operational details remain private.',
    ],
  },
] as const;
