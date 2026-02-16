export type NetworkKind = 'Education' | 'Research' | 'Project' | 'Org' | 'Event' | 'Experience';

export type NetworkNode = {
  id: string;
  kind: NetworkKind;
  title: string;
  subtitle: string;
  period?: string;
  weight: 1 | 2 | 3 | 4 | 5;
  tags: readonly string[];
  links?: Partial<{
    url: string;
    repo: string;
    article: string;
  }>;
  bullets: readonly string[];
};

export type NetworkIdeaEdge = {
  from: string;
  to: string;
  idea: string;
  strength?: 1 | 2 | 3;
};

export const networkNodes: readonly NetworkNode[] = [
  {
    id: 'edu-york-ma-human-rights',
    kind: 'Education',
    title: 'University of York',
    subtitle: 'MA, Applied Human Rights',
    period: '2009 - 2011',
    weight: 4,
    tags: ['human rights', 'justice', 'ethics', 'policy'],
    bullets: [
      'Built a justice-first lens for technical systems.',
      'Grounded optimization questions in human dignity and agency.',
    ],
  },
  {
    id: 'edu-sofia-ba-philosophy-science',
    kind: 'Education',
    title: 'Sofia University St. Kliment Ohridski',
    subtitle: 'BA, Philosophy (Philosophy of Science), dissertation on String Theory',
    period: '2003 - 2007',
    weight: 5,
    tags: ['philosophy of science', 'physics', 'epistemology', 'reason'],
    bullets: [
      'Bridge between conceptual rigor, physics abstractions, and explanation.',
      'Scientific method and formal reasoning as design constraints.',
    ],
  },
  {
    id: 'edu-sofia-ir',
    kind: 'Education',
    title: 'Sofia University St. Kliment Ohridski',
    subtitle: 'International Relations and Affairs',
    period: '2005 - 2007',
    weight: 3,
    tags: ['systems thinking', 'institutions', 'geopolitics'],
    bullets: [
      'Developed multi-stakeholder systems perspective.',
      'Institutional context framing for responsible technology.',
    ],
  },
  {
    id: 'edu-bcs-ba-practice',
    kind: 'Education',
    title: 'BCS, The Chartered Institute for IT',
    subtitle: 'Certificate, Business Analysis Practice',
    weight: 2,
    tags: ['business analysis', 'requirements', 'delivery'],
    bullets: [
      'Structured requirements into implementable systems.',
      'Linked problem framing with measurable outcomes.',
    ],
  },

  {
    id: 'research-phenomenology-search',
    kind: 'Research',
    title: 'The Phenomenology of Search',
    subtitle: 'How LLMs navigate second-order representations',
    period: 'Sep 2025',
    weight: 4,
    tags: ['search', 'representation', 'authority', 'llm'],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/phenomenology-search-llms-second-order-representations',
    },
    bullets: [
      'Meaning geometry and trust signals jointly shape retrieval quality.',
      'Credibility is a core optimization variable, not a post-filter.',
    ],
  },
  {
    id: 'research-memory-agency',
    kind: 'Research',
    title: 'Memory and Agency',
    subtitle: 'How to build an LLM agent that remembers',
    period: 'Sep 2025',
    weight: 5,
    tags: ['memory', 'agents', 'provenance', 'learning loops'],
    links: {
      article: 'https://ai-news-hub.performics-labs.com/analysis/memory-and-agency',
    },
    bullets: [
      'Memory as compressed, quality-gated learning artifacts.',
      'Continuity + feedback loops as prerequisites for agency.',
    ],
  },
  {
    id: 'research-geometry-intention',
    kind: 'Research',
    title: 'The Geometry of Intention',
    subtitle: 'How LLMs predict human goals in marketing contexts',
    period: 'Nov 2025',
    weight: 5,
    tags: ['intent', 'context', 'ccia', 'goal inference'],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/geometry-of-intention-llms-human-goals-marketing',
    },
    bullets: [
      'Context-conditioned intent activation for practical intent modeling.',
      'From click-streams to explicit goal interpretation.',
    ],
  },
  {
    id: 'research-empowerment-imperative',
    kind: 'Research',
    title: 'The Empowerment Imperative',
    subtitle: 'From extraction to human flourishing',
    period: 'Jan 2026',
    weight: 5,
    tags: ['empowerment', 'ethics', 'objective functions', 'agency'],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/empowerment-imperative-agentic-marketing-human-flourishing',
    },
    bullets: [
      'Objective function design decides whether systems extract or empower.',
      'Argues for an Agency Layer in agentic commerce.',
    ],
  },
  {
    id: 'research-building-to-learn',
    kind: 'Research',
    title: 'Building to Learn',
    subtitle: 'Three weeks of prototyping in agentic marketing optimization',
    period: 'Feb 2026',
    weight: 4,
    tags: ['experiments', 'closed loop', 'validation', 'optimization'],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/building-to-learn-agentic-marketing-optimization',
    },
    bullets: [
      'Simulation and reality checks reveal structural validation gaps.',
      'Engineering posture: iterate quickly, measure honestly, refine theory.',
    ],
  },

  {
    id: 'project-intent-recognition-agent',
    kind: 'Project',
    title: 'Intent Recognition Agent',
    subtitle: '4-layer intent system with MCP integration',
    weight: 5,
    tags: ['mcp', 'intent modeling', 'hdbscan', 'embeddings', 'python'],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
      url: 'https://huggingface.co/spaces/Dessi/gradio-mcp-hack',
    },
    bullets: [
      'Layered pipeline: context capture, intent inference, pattern discovery, activation.',
      'Confidence calibration + practical integration with ad-tech execution.',
    ],
  },
  {
    id: 'project-agentic-commerce-loop',
    kind: 'Project',
    title: 'Agentic Commerce Learning Loop',
    subtitle: 'Bayesian-style multi-tenant optimization platform',
    weight: 5,
    tags: ['nextjs', 'fastapi', 'sqlite', 'learning loop', 'multi-tenant'],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
    },
    bullets: [
      'Closed loop: simulate, validate, revise beliefs, distill memory, repeat.',
      'Synthetic + observed validation with protocol transparency.',
    ],
  },
  {
    id: 'project-ai-news-hub',
    kind: 'Project',
    title: 'AI News Hub (Performics Labs)',
    subtitle: 'Technical publishing platform for AI + marketing infrastructure',
    weight: 4,
    tags: ['astro', 'content systems', 'research communication', 'vercel'],
    links: {
      url: 'https://ai-news-hub.performics-labs.com/',
    },
    bullets: [
      'Three-layer publishing model: news analysis, deep research, all-hands.',
      'Turns complex AI ideas into practitioner-ready technical guidance.',
    ],
  },
  {
    id: 'project-warehouse-amazon',
    kind: 'Project',
    title: 'Amazon Optimization Platform (Warehouse)',
    subtitle: 'Award-winning ecommerce marketing optimization',
    weight: 4,
    tags: ['fastapi', 'aws glue', 'lambda', 'postgres', 'microservices'],
    links: {
      article:
        'https://www.performancemarketingworldawards.com/finalists/unifying-retail-data-with-publicis-warehouse-7y3bxeifqg035ne',
    },
    bullets: [
      'Backend services and cloud event architecture for optimization workflows.',
      'Production-grade deployment in enterprise environments.',
    ],
  },

  {
    id: 'org-performics',
    kind: 'Org',
    title: 'Performics (Publicis Media)',
    subtitle: 'Data Engineer, Innovations Lab',
    period: 'Nov 2023 - Present',
    weight: 3,
    tags: ['agentic commerce', 'multi-tenant', 'aws', 'databricks'],
    bullets: [
      'Built AI systems for marketing intelligence and orchestration.',
      'Connected research ideas to production workflows.',
    ],
  },
  {
    id: 'org-jellyfish',
    kind: 'Org',
    title: 'Jellyfish',
    subtitle: 'Business Intelligence Manager',
    period: 'Jan 2021 - Mar 2023',
    weight: 2,
    tags: ['shiny', 'aws etl', 'data lake', 'terraform'],
    bullets: [
      'Delivered production reporting apps and data infrastructure.',
      'Scaled data workflows across analytics and marketing operations.',
    ],
  },
  {
    id: 'org-publicis-media',
    kind: 'Org',
    title: 'Publicis Media',
    subtitle: 'Senior Business Intelligence Analyst',
    period: 'Mar 2023 - Nov 2023',
    weight: 2,
    tags: ['databricks', 'plotly dash', 'analytics'],
    bullets: [
      'Bridged BI foundations with AI-era system requirements.',
      'Advanced analytical experimentation at enterprise scale.',
    ],
  },
  {
    id: 'org-early-foundation',
    kind: 'Org',
    title: 'Early Career in NGOs and Policy',
    subtitle: 'Peace Direct, Friends of the Earth, Orangutan Protection Foundation, others',
    period: '2008 - 2017',
    weight: 2,
    tags: ['policy research', 'fundraising systems', 'social impact', 'ethics'],
    bullets: [
      'Mission-driven data practice before ad-tech and AI engineering.',
      'Long arc: justice and environmental responsibility into technical work.',
    ],
  },

  {
    id: 'event-allhands-memory-agency',
    kind: 'Event',
    title: 'All-Hands: Memory and Agency',
    subtitle: 'Build memory-enabled agents that improve over time',
    period: 'Sep 2025',
    weight: 3,
    tags: ['community building', 'hackathon', 'agents', 'memory'],
    bullets: [
      'Pre-read, discuss, build-week, demo-and-publish loop.',
      'Translated research into practical prototypes.',
    ],
  },
  {
    id: 'event-allhands-geometry',
    kind: 'Event',
    title: 'All-Hands: Geometry of Intention',
    subtitle: 'Intent-recognition agents and MCP prototypes',
    period: 'Nov 2025',
    weight: 3,
    tags: ['mcp', 'hackathon', 'intent recognition', 'context modeling'],
    bullets: [
      'Connected theory to tool-building for real agent workflows.',
      'Focused on confidence scoring and ethical boundaries.',
    ],
  },
  {
    id: 'event-allhands-empowerment',
    kind: 'Event',
    title: 'All-Hands: Empowerment Imperative',
    subtitle: 'Agency Layer sprint + Gemini hackathon bridge',
    period: 'Jan 2026',
    weight: 4,
    tags: ['agency layer', 'gemini hackathon', 'dual metrics', 'constraints'],
    bullets: [
      'Prototyped empowerment-first alternatives to extraction logic.',
      'Defined acceptance criteria around consent and capability expansion.',
    ],
  },

  {
    id: 'exp-data-consulting-arc',
    kind: 'Experience',
    title: 'Consulting Arc (Data and CRM)',
    subtitle: 'Founders Forum, Reed, Grapeshot, Wunderman Thompson, others',
    period: '2017 - 2020',
    weight: 1,
    tags: ['sql', 'salesforce', 'pardot', 'r', 'data strategy'],
    bullets: [
      'Built practical foundations in data integration, segmentation, and automation.',
      'Ground-level exposure to real operational constraints.',
    ],
  },
  {
    id: 'exp-marketing-analytics-arc',
    kind: 'Experience',
    title: 'Marketing Analytics Arc',
    subtitle: 'From campaign analytics to systems engineering',
    period: '2016 - 2023',
    weight: 1,
    tags: ['marketing analytics', 'experimentation', 'measurement', 'attribution'],
    bullets: [
      'Evolved from campaign intelligence to architecture and AI systems.',
      'Retained practical obsession with measurable outcomes.',
    ],
  },
] as const;

export const networkIdeaEdges: readonly NetworkIdeaEdge[] = [
  {
    from: 'edu-sofia-ba-philosophy-science',
    to: 'research-phenomenology-search',
    idea: 'meaning as geometry',
    strength: 2,
  },
  {
    from: 'edu-sofia-ba-philosophy-science',
    to: 'research-geometry-intention',
    idea: 'formal models of intention',
    strength: 3,
  },
  {
    from: 'edu-york-ma-human-rights',
    to: 'research-empowerment-imperative',
    idea: 'justice as objective function',
    strength: 3,
  },
  {
    from: 'edu-york-ma-human-rights',
    to: 'event-allhands-empowerment',
    idea: 'ethics into build practice',
    strength: 2,
  },
  {
    from: 'edu-bcs-ba-practice',
    to: 'project-agentic-commerce-loop',
    idea: 'requirements to architecture',
    strength: 2,
  },
  {
    from: 'research-memory-agency',
    to: 'project-agentic-commerce-loop',
    idea: 'memory distillation loops',
    strength: 3,
  },
  {
    from: 'research-geometry-intention',
    to: 'project-intent-recognition-agent',
    idea: 'CCIA implementation',
    strength: 3,
  },
  {
    from: 'research-empowerment-imperative',
    to: 'project-agentic-commerce-loop',
    idea: 'agency layer constraints',
    strength: 3,
  },
  {
    from: 'research-building-to-learn',
    to: 'project-agentic-commerce-loop',
    idea: 'experiment-driven iteration',
    strength: 2,
  },
  {
    from: 'research-phenomenology-search',
    to: 'project-ai-news-hub',
    idea: 'search-aware publishing',
    strength: 2,
  },
  {
    from: 'research-memory-agency',
    to: 'event-allhands-memory-agency',
    idea: 'theory to community sprint',
    strength: 2,
  },
  {
    from: 'research-geometry-intention',
    to: 'event-allhands-geometry',
    idea: 'intent to MCP build',
    strength: 3,
  },
  {
    from: 'research-empowerment-imperative',
    to: 'event-allhands-empowerment',
    idea: 'fork: extraction vs empowerment',
    strength: 3,
  },
  {
    from: 'project-agentic-commerce-loop',
    to: 'org-performics',
    idea: 'production transfer',
    strength: 2,
  },
  {
    from: 'project-intent-recognition-agent',
    to: 'org-performics',
    idea: 'research-backed implementation',
    strength: 2,
  },
  {
    from: 'project-warehouse-amazon',
    to: 'org-performics',
    idea: 'enterprise deployment practice',
    strength: 2,
  },
  {
    from: 'project-ai-news-hub',
    to: 'org-performics',
    idea: 'open technical communication',
    strength: 1,
  },
  {
    from: 'org-jellyfish',
    to: 'org-performics',
    idea: 'analytics to AI systems evolution',
    strength: 1,
  },
  {
    from: 'org-publicis-media',
    to: 'org-performics',
    idea: 'bridge role into innovation lab',
    strength: 1,
  },
  {
    from: 'org-early-foundation',
    to: 'research-empowerment-imperative',
    idea: 'social impact continuity',
    strength: 2,
  },
  {
    from: 'exp-data-consulting-arc',
    to: 'project-agentic-commerce-loop',
    idea: 'operational constraints literacy',
    strength: 1,
  },
  {
    from: 'exp-marketing-analytics-arc',
    to: 'research-geometry-intention',
    idea: 'from behavior metrics to intent models',
    strength: 2,
  },
] as const;

export const networkLinks = {
  githubOrg: 'https://github.com/orgs/ai-knowledge-hub/repositories',
  githubPersonal: 'https://github.com/DG-creative-lab?tab=repositories',
  newsHub: 'https://ai-news-hub.performics-labs.com/',
} as const;
