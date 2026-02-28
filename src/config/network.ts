export type NetworkKind = 'Education' | 'Research' | 'Project' | 'Org' | 'Event' | 'Experience';

export type NetworkNode = {
  id: string;
  kind: NetworkKind;
  title: string;
  subtitle: string;
  period?: string;
  weight: 1 | 2 | 3 | 4 | 5;
  tags: readonly string[];
  bullets: readonly string[];
  links?: Partial<{
    url: string;
    repo: string;
    article: string;
  }>;
};

export type NetworkIdeaEdge = {
  from: string;
  to: string;
  idea: string;
  strength?: 1 | 2 | 3 | 4 | 5;
  style?: 'solid' | 'dotted';
};

export const networkNodes: readonly NetworkNode[] = [
  {
    id: 'edu-philosophy',
    kind: 'Education',
    title: 'BA Philosophy',
    subtitle: 'Sofia University (Philosophy of Science)',
    period: '2003 - 2007',
    weight: 1,
    tags: ['philosophy of science', 'epistemology', 'philosophy of mind', 'ethics'],
    bullets: [
      'Foundation for reasoning about mind, knowledge, and scientific method.',
      'Built the philosophical thread behind agency-first systems design.',
    ],
  },
  {
    id: 'edu-human-rights',
    kind: 'Education',
    title: 'MA Applied Human Rights',
    subtitle: 'University of York',
    period: '2009 - 2011',
    weight: 1,
    tags: ['human rights', 'ethics', 'policy', 'agency', 'empowerment'],
    bullets: [
      'Ethical frameworks for technology and social systems.',
      'Grounded the empowerment-vs-extraction lens.',
    ],
  },

  {
    id: 'intent-recognition-agent',
    kind: 'Project',
    title: 'Intent Recognition Agent',
    subtitle: 'Performics Innovations Lab',
    period: '2024 - Present',
    weight: 5,
    tags: [
      'multi-agent systems',
      'behavioral embeddings',
      'semantic clustering',
      'intent modeling',
      'marketing intelligence',
      'aws',
    ],
    bullets: [
      'Four-layer intent system for marketing intelligence.',
      'Behavioral embeddings + semantic clustering for inference.',
      'Enterprise-grade deployment patterns.',
    ],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
    },
  },
  {
    id: 'agentic-commerce-loop',
    kind: 'Project',
    title: 'Agentic Commerce Learning Loop',
    subtitle: 'Performics Innovations Lab',
    period: '2024 - Present',
    weight: 5,
    tags: [
      'bayesian learning',
      'multi-tenant',
      'learning systems',
      'commerce',
      'personalization',
      'aws',
    ],
    bullets: [
      'Multi-tenant Bayesian-style learning architecture.',
      'Continuous loop from simulation to belief updates.',
      '124+ commits of iterative system design.',
    ],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
    },
  },
  {
    id: 'ai-skills-platform',
    kind: 'Project',
    title: 'AI Skills Platform',
    subtitle: 'AI Knowledge Hub (Open Source)',
    period: '2024 - Present',
    weight: 5,
    tags: [
      'open source',
      'skills infrastructure',
      'agent orchestration',
      'marketing agents',
      'guardrails',
      'runtime-agnostic',
    ],
    bullets: [
      'Open-source skills for marketing AI agents.',
      '14 reusable skills with guardrails and tests.',
      'Works across Codex, Claude, and generic agent runtimes.',
    ],
    links: {
      url: 'https://skills.ai-knowledge-hub.org/',
      repo: 'https://github.com/ai-knowledge-hub/all-hands',
    },
  },

  {
    id: 'ai-news-hub',
    kind: 'Project',
    title: 'AI News Hub',
    subtitle: 'Performics Labs',
    period: '2024 - Present',
    weight: 4,
    tags: [
      'content platform',
      'astro',
      'community building',
      'ai news',
      'research writing',
      'thought leadership',
    ],
    bullets: [
      'Grew to 200+ organic followers in 6 months.',
      'Combines news analysis with deep technical research.',
      'Public interface for the empowerment thesis.',
    ],
    links: {
      url: 'https://ai-news-hub.performics-labs.com/',
    },
  },

  {
    id: 'research-agentic-commerce',
    kind: 'Research',
    title: 'Agentic Commerce Augmentation',
    subtitle: 'Deep Dive Analysis',
    period: '2025',
    weight: 4,
    tags: ['intentionality optimization', 'commerce', 'llm discovery', 'organic discovery'],
    bullets: [
      'Intentionality optimization for product discovery.',
      'Capability-based matching for reasoning agents.',
      'Simulation sandbox for recommendation behavior.',
    ],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-agentic-commerce-augmentation',
    },
  },
  {
    id: 'research-intent-recognition',
    kind: 'Research',
    title: 'Intent Recognition Research',
    subtitle: 'Deep Dive Analysis',
    period: '2025',
    weight: 4,
    tags: ['intent inference', 'semantic routing', 'embeddings', 'multi-agent', 'nlp'],
    bullets: [
      'Intent inference frameworks for agent systems.',
      'Semantic routing with vector embeddings.',
      'Hybrid strategies for robust intent detection.',
    ],
    links: {
      repo: 'https://github.com/ai-knowledge-hub/deep-dive-analysis-intent-recognition-agent',
    },
  },
  {
    id: 'research-phenomenology-search',
    kind: 'Research',
    title: 'Phenomenology of Search',
    subtitle: 'Deep Dive Analysis',
    period: '2025',
    weight: 4,
    tags: ['phenomenology', 'search', 'human experience', 'discovery', 'philosophy', 'ai ethics'],
    bullets: [
      'Philosophical analysis of search and discovery.',
      'Connects lived experience with AI-mediated retrieval.',
      'Bridges philosophy of mind and search systems.',
    ],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/phenomenology-search-llms-second-order-representations',
    },
  },
  {
    id: 'research-empowering-agents',
    kind: 'Research',
    title: 'Empowering Marketing Agents',
    subtitle: 'Deep Dive Analysis',
    period: '2025',
    weight: 4,
    tags: ['human agency', 'empowerment', 'marketing agents', 'ethics', 'ai alignment'],
    bullets: [
      'How to design AI agents that empower rather than extract.',
      'Ethical architectures for marketing automation.',
      'Agency-preserving patterns for real systems.',
    ],
    links: {
      article:
        'https://ai-news-hub.performics-labs.com/analysis/empowerment-imperative-agentic-marketing-human-flourishing',
    },
  },
  {
    id: 'research-intelligent-marketing',
    kind: 'Research',
    title: 'Intelligent Marketing',
    subtitle: 'Deep Dive Analysis',
    period: '2025',
    weight: 4,
    tags: ['marketing intelligence', 'ai marketing', 'automation', 'personalization'],
    bullets: [
      'AI-native marketing intelligence design patterns.',
      'Bridges research hypotheses and production outcomes.',
    ],
    links: {
      article: 'https://ai-news-hub.performics-labs.com/analysis',
    },
  },

  {
    id: 'hackathon-chrome-ai',
    kind: 'Event',
    title: 'Chrome AI Hackathon',
    subtitle: 'Hackathon Project',
    period: '2025',
    weight: 3,
    tags: ['browser ai', 'chrome', 'hackathon', 'web'],
    bullets: ['Browser-native AI experimentation and shipping.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/chrome-ai-hackathon',
    },
  },
  {
    id: 'hackathon-aria-openai',
    kind: 'Event',
    title: 'ARIA OpenAI Hackathon',
    subtitle: 'Hackathon Project',
    period: '2025',
    weight: 3,
    tags: ['voice ai', 'accessibility', 'openai', 'hackathon'],
    bullets: ['Voice and accessibility-oriented agent experimentation.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/aria-openai-hackathon',
    },
  },
  {
    id: 'hackathon-mastra',
    kind: 'Event',
    title: 'Routine Mastra Hackathon',
    subtitle: 'Hackathon Project',
    period: '2025',
    weight: 3,
    tags: ['workflow automation', 'mastra', 'agents', 'hackathon'],
    bullets: ['Agent orchestration and workflow reliability patterns.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/routine-mastra-hackathon',
    },
  },

  {
    id: 'dg-labs-os',
    kind: 'Project',
    title: 'DG Labs OS',
    subtitle: 'Personal Labs Platform',
    period: '2025 - Present',
    weight: 3,
    tags: ['typescript', 'platform', 'labs', 'open source', 'system design'],
    bullets: [
      'Operating-system metaphor portfolio for ideas and builds.',
      'Integration surface for agentic projects and research.',
    ],
    links: {
      repo: 'https://github.com/DG-creative-lab/dg-labs-os',
    },
  },
  {
    id: 'mac-gpu-toolkit',
    kind: 'Project',
    title: 'Mac GPU Toolkit',
    subtitle: 'Local ML Infrastructure',
    period: '2025',
    weight: 3,
    tags: ['python', 'gpu', 'ml', 'local inference', 'apple silicon'],
    bullets: ['Local ML and GPU acceleration utilities for experimentation.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/mac-gpu-toolkit',
    },
  },
  {
    id: 'reddit-connector',
    kind: 'Experience',
    title: 'Reddit Connector',
    subtitle: 'Data Pipeline Utility',
    period: '2025',
    weight: 2,
    tags: ['python', 'data pipeline', 'reddit', 'api', 'scraping'],
    bullets: ['Connector and data pipeline for social content ingestion.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/reddit_connector',
    },
  },
  {
    id: 'oidc-mock',
    kind: 'Experience',
    title: 'OIDC Mock',
    subtitle: 'Auth Testing Tool',
    period: '2025',
    weight: 2,
    tags: ['typescript', 'oidc', 'authentication', 'testing'],
    bullets: ['Mock identity provider for authentication testing workflows.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/oidc-mock',
    },
  },

  {
    id: 'customer-segmentation',
    kind: 'Experience',
    title: 'Customer Segmentation',
    subtitle: 'K-Means Clustering',
    period: '2020',
    weight: 2,
    tags: ['r', 'machine learning', 'clustering', 'k-means', 'analytics'],
    bullets: ['Behavioral clustering foundations for later intent work.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/Customer_segmentation_with_K_Means_Clustering',
    },
  },
  {
    id: 'iowa-liquor-dashboard',
    kind: 'Experience',
    title: 'Iowa Liquor Dashboard',
    subtitle: 'R Shiny Visualization',
    period: '2021',
    weight: 2,
    tags: ['r', 'shiny', 'dashboard', 'visualization'],
    bullets: ['Interactive visualization patterns in R Shiny.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/Iowa_Liquor_open_data_Shiny_dashboard',
    },
  },
  {
    id: 'ecommerce-insights',
    kind: 'Experience',
    title: 'E-commerce Insights',
    subtitle: 'R Analytics',
    period: '2020',
    weight: 2,
    tags: ['r', 'analytics', 'ecommerce', 'visualization'],
    bullets: ['Insight extraction and dashboarding for ecommerce data.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/ecommerce_insights',
    },
  },
  {
    id: 'startup-scraper',
    kind: 'Experience',
    title: 'Startup Scraper',
    subtitle: 'EU Startup Rankings',
    period: '2020',
    weight: 2,
    tags: ['r', 'scraping', 'startups', 'data collection'],
    bullets: ['Scraping and data prep for startup ranking applications.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/Startup_scraper_app',
    },
  },
  {
    id: 'sales-dashboard',
    kind: 'Experience',
    title: 'Sales Dashboard',
    subtitle: 'R Flexdashboard',
    period: '2020',
    weight: 2,
    tags: ['r', 'shiny', 'flexdashboard', 'visualization', 'sales'],
    bullets: ['Reusable dashboard UX patterns for business analytics.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/Sales_Shiny_Dashboard',
    },
  },
  {
    id: 'dummy-ads-data',
    kind: 'Experience',
    title: 'Dummy Ads Data Generator',
    subtitle: 'ML and Visualization Data',
    period: '2023',
    weight: 2,
    tags: ['python', 'data generation', 'advertising', 'ml', 'synthetic data'],
    bullets: ['Synthetic dataset generation for analytics and ML prototypes.'],
    links: {
      repo: 'https://github.com/DG-creative-lab/dummy_ads_data',
    },
  },

  {
    id: 'org-performics',
    kind: 'Experience',
    title: 'Performics',
    subtitle: 'Data Engineer, Innovations Lab',
    period: 'Nov 2023 - Present',
    weight: 2,
    tags: ['databricks', 'aws', 'agentic systems', 'innovation lab'],
    bullets: ['Current role: production AI systems for marketing intelligence.'],
  },
  {
    id: 'org-publicis-media',
    kind: 'Experience',
    title: 'Publicis Media',
    subtitle: 'Senior Business Intelligence Analyst',
    period: 'Mar 2023 - Nov 2023',
    weight: 2,
    tags: ['databricks', 'plotly dash', 'analytics'],
    bullets: ['Scaled enterprise analytics and experimentation systems.'],
  },
  {
    id: 'org-jellyfish',
    kind: 'Experience',
    title: 'Jellyfish',
    subtitle: 'Business Intelligence Manager',
    period: 'Jan 2021 - Mar 2023',
    weight: 2,
    tags: ['r shiny', 'aws etl', 'terraform', 'data lake'],
    bullets: ['Production reporting engineering and cloud data pipelines.'],
  },
  {
    id: 'org-founders-forum',
    kind: 'Experience',
    title: 'Founders Forum',
    subtitle: 'Data Consultant',
    period: 'Jan 2020 - Apr 2020',
    weight: 2,
    tags: ['sql', 'r', 'salesforce', 'pardot', 'ibm watson'],
    bullets: ['Database migration, ETL, and documentation delivery.'],
  },
  {
    id: 'org-toaster',
    kind: 'Experience',
    title: 'Toaster',
    subtitle: 'Data Analyst',
    period: 'Oct 2019',
    weight: 2,
    tags: ['r', 'sql', 'bigquery', 'ab testing', 'sentiment analysis'],
    bullets: ['Marketing analysis and experiment design for product campaigns.'],
  },
  {
    id: 'org-wunderman-thompson',
    kind: 'Experience',
    title: 'Wunderman Thompson',
    subtitle: 'SQL Developer',
    period: 'Dec 2018 - Mar 2019',
    weight: 2,
    tags: ['sql', 'segmentation', 'data quality'],
    bullets: ['Data cleansing, enrichment, and QA for direct marketing.'],
  },
  {
    id: 'org-bcw-global',
    kind: 'Experience',
    title: 'BCW Global',
    subtitle: 'Data Consultant',
    period: 'Nov 2018 - Dec 2018',
    weight: 2,
    tags: ['r shiny', 'media budgeting'],
    bullets: ['Prototype budget calculator for social ad spend.'],
  },
  {
    id: 'org-reed-bi',
    kind: 'Experience',
    title: 'Reed Business Information',
    subtitle: 'Data Specialist',
    period: 'Jul 2018 - Oct 2018',
    weight: 2,
    tags: ['sql', 'salesforce', 'adobe analytics', 'alteryx'],
    bullets: ['Data strategy, integration, and automation workflows.'],
  },
  {
    id: 'org-founders-factory',
    kind: 'Experience',
    title: 'Founders Factory Ltd',
    subtitle: 'Data Consultant',
    period: 'Jun 2018 - Jul 2018',
    weight: 2,
    tags: ['web scraping', 'r', 'sql'],
    bullets: ['Web scraping and normalization for startup marketing datasets.'],
  },
  {
    id: 'org-grapeshot',
    kind: 'Experience',
    title: 'Grapeshot',
    subtitle: 'CRM Business Data Consultant',
    period: 'Oct 2017 - Jan 2018',
    weight: 2,
    tags: ['sql', 'salesforce', 'pardot', 'alteryx'],
    bullets: ['Data integration strategy and sales intelligence reporting.'],
  },
  {
    id: 'org-the-drum',
    kind: 'Experience',
    title: 'The Drum',
    subtitle: 'Customer Data Analyst',
    period: 'Apr 2017 - Sep 2017',
    weight: 2,
    tags: ['sql', 'salesforce', 'pardot', 'crm campaigns'],
    bullets: ['Campaign execution, profiling, segmentation, and KPI reporting.'],
  },
  {
    id: 'org-rnib',
    kind: 'Experience',
    title: 'RNIB',
    subtitle: 'Marketing Data Selections Executive',
    period: 'Jul 2016 - Mar 2017',
    weight: 2,
    tags: ['marketing data', 'nonprofit'],
    bullets: ['Audience selections and marketing data operations.'],
  },
  {
    id: 'org-richard-house',
    kind: 'Experience',
    title: "Richard House Children's Hospice",
    subtitle: 'Database Consultant (Contract)',
    period: 'May 2015 - Dec 2015',
    weight: 2,
    tags: ['database consulting', 'nonprofit'],
    bullets: ['Database operations in nonprofit healthcare context.'],
  },
  {
    id: 'org-peace-direct',
    kind: 'Experience',
    title: 'Peace Direct',
    subtitle: 'Fundraising and Database Officer',
    period: 'Feb 2014 - Oct 2015',
    weight: 2,
    tags: ['fundraising', 'database'],
    bullets: ['Fundraising intelligence and database stewardship.'],
  },
  {
    id: 'org-orangutan-protection',
    kind: 'Experience',
    title: 'Orangutan Protection Foundation',
    subtitle: 'Project Coordinator',
    period: 'Nov 2012 - Apr 2015',
    weight: 2,
    tags: ['project coordination', 'nonprofit'],
    bullets: ['Program coordination for mission-driven operations.'],
  },
  {
    id: 'org-link-ethiopia',
    kind: 'Experience',
    title: 'Link Ethiopia',
    subtitle: 'School Links Assistant',
    period: 'Mar 2012 - Oct 2012',
    weight: 2,
    tags: ['education', 'community'],
    bullets: ['Community and school partnership support.'],
  },
  {
    id: 'org-friends-earth',
    kind: 'Experience',
    title: 'Friends of the Earth',
    subtitle: 'Policy Research Intern',
    period: 'Feb 2010 - Sep 2010',
    weight: 2,
    tags: ['policy research', 'environment'],
    bullets: ['Policy research foundation in environmental advocacy.'],
  },
  {
    id: 'org-centre-democracy',
    kind: 'Experience',
    title: 'Centre for the Study of Democracy',
    subtitle: 'Policy Research and Administration Assistant',
    period: 'Dec 2008 - Sep 2009',
    weight: 2,
    tags: ['policy research', 'administration'],
    bullets: ['Early policy research and administration foundations.'],
  },
] as const;

export const networkIdeaEdges: readonly NetworkIdeaEdge[] = [
  {
    from: 'edu-philosophy',
    to: 'research-phenomenology-search',
    idea: 'philosophy of mind',
    strength: 3,
    style: 'dotted',
  },
  {
    from: 'edu-philosophy',
    to: 'research-empowering-agents',
    idea: 'ethics of technology',
    strength: 3,
    style: 'dotted',
  },
  {
    from: 'edu-human-rights',
    to: 'research-empowering-agents',
    idea: 'human agency',
    strength: 4,
    style: 'dotted',
  },
  {
    from: 'edu-human-rights',
    to: 'research-phenomenology-search',
    idea: 'empowerment vs extraction',
    strength: 4,
    style: 'dotted',
  },

  {
    from: 'intent-recognition-agent',
    to: 'research-intent-recognition',
    idea: 'intent modeling',
    strength: 5,
  },
  {
    from: 'intent-recognition-agent',
    to: 'research-phenomenology-search',
    idea: 'behavioral semantics',
    strength: 4,
  },
  {
    from: 'research-intent-recognition',
    to: 'research-agentic-commerce',
    idea: 'intent inference',
    strength: 4,
  },
  {
    from: 'customer-segmentation',
    to: 'intent-recognition-agent',
    idea: 'behavioral clustering',
    strength: 3,
  },

  {
    from: 'intent-recognition-agent',
    to: 'ai-skills-platform',
    idea: 'multi-agent design',
    strength: 5,
  },
  {
    from: 'agentic-commerce-loop',
    to: 'research-agentic-commerce',
    idea: 'learning architecture',
    strength: 5,
  },
  {
    from: 'ai-skills-platform',
    to: 'research-empowering-agents',
    idea: 'skill orchestration',
    strength: 4,
  },
  {
    from: 'hackathon-mastra',
    to: 'dg-labs-os',
    idea: 'workflow agents',
    strength: 3,
  },

  {
    from: 'intent-recognition-agent',
    to: 'agentic-commerce-loop',
    idea: 'aws infrastructure',
    strength: 4,
    style: 'dotted',
  },
  {
    from: 'agentic-commerce-loop',
    to: 'ai-skills-platform',
    idea: 'cloud deployment',
    strength: 3,
    style: 'dotted',
  },
  {
    from: 'ai-skills-platform',
    to: 'ai-news-hub',
    idea: 'cloud architecture',
    strength: 3,
    style: 'dotted',
  },
  {
    from: 'dg-labs-os',
    to: 'intent-recognition-agent',
    idea: 'system design',
    strength: 3,
    style: 'dotted',
  },

  {
    from: 'ai-skills-platform',
    to: 'dg-labs-os',
    idea: 'open source',
    strength: 4,
  },
  {
    from: 'dg-labs-os',
    to: 'mac-gpu-toolkit',
    idea: 'local ML infra',
    strength: 3,
  },

  {
    from: 'agentic-commerce-loop',
    to: 'research-intelligent-marketing',
    idea: 'marketing ML',
    strength: 5,
  },
  {
    from: 'ai-news-hub',
    to: 'research-intelligent-marketing',
    idea: 'content intelligence',
    strength: 4,
  },
  {
    from: 'research-empowering-agents',
    to: 'research-intelligent-marketing',
    idea: 'agent empowerment',
    strength: 4,
  },

  {
    from: 'research-empowering-agents',
    to: 'research-phenomenology-search',
    idea: 'human agency',
    strength: 5,
  },
  {
    from: 'research-phenomenology-search',
    to: 'ai-skills-platform',
    idea: 'discovery ethics',
    strength: 4,
  },
  {
    from: 'research-agentic-commerce',
    to: 'research-empowering-agents',
    idea: 'intentionality',
    strength: 4,
  },
  {
    from: 'ai-news-hub',
    to: 'research-phenomenology-search',
    idea: 'democratizing ai',
    strength: 3,
  },

  {
    from: 'agentic-commerce-loop',
    to: 'research-agentic-commerce',
    idea: 'bayesian learning',
    strength: 5,
  },
  {
    from: 'customer-segmentation',
    to: 'agentic-commerce-loop',
    idea: 'ml foundations',
    strength: 3,
  },

  {
    from: 'iowa-liquor-dashboard',
    to: 'sales-dashboard',
    idea: 'interactive viz',
    strength: 3,
  },
  {
    from: 'sales-dashboard',
    to: 'ecommerce-insights',
    idea: 'dashboard patterns',
    strength: 3,
  },
  {
    from: 'ecommerce-insights',
    to: 'ai-news-hub',
    idea: 'insight dashboards',
    strength: 3,
  },
  {
    from: 'startup-scraper',
    to: 'ecommerce-insights',
    idea: 'data scraping',
    strength: 2,
  },

  {
    from: 'hackathon-chrome-ai',
    to: 'hackathon-aria-openai',
    idea: 'browser ai',
    strength: 2,
  },
  {
    from: 'hackathon-aria-openai',
    to: 'hackathon-mastra',
    idea: 'voice and automation',
    strength: 2,
  },
  {
    from: 'hackathon-mastra',
    to: 'ai-skills-platform',
    idea: 'agent workflows',
    strength: 3,
  },

  {
    from: 'reddit-connector',
    to: 'ai-news-hub',
    idea: 'content sourcing',
    strength: 2,
  },
  {
    from: 'oidc-mock',
    to: 'dg-labs-os',
    idea: 'auth testing',
    strength: 2,
  },

  {
    from: 'org-centre-democracy',
    to: 'org-friends-earth',
    idea: 'policy research progression',
    strength: 1,
  },
  {
    from: 'org-friends-earth',
    to: 'org-link-ethiopia',
    idea: 'mission operations trajectory',
    strength: 1,
  },
  {
    from: 'org-link-ethiopia',
    to: 'org-orangutan-protection',
    idea: 'community to program coordination',
    strength: 1,
  },
  {
    from: 'org-orangutan-protection',
    to: 'org-peace-direct',
    idea: 'impact operations and data stewardship',
    strength: 1,
  },
  {
    from: 'org-peace-direct',
    to: 'org-richard-house',
    idea: 'nonprofit database practice',
    strength: 1,
  },
  {
    from: 'org-richard-house',
    to: 'org-rnib',
    idea: 'database consulting to marketing data',
    strength: 1,
  },
  {
    from: 'org-rnib',
    to: 'org-the-drum',
    idea: 'segmentation to campaign analytics',
    strength: 1,
  },
  {
    from: 'org-the-drum',
    to: 'org-grapeshot',
    idea: 'crm intelligence evolution',
    strength: 1,
  },
  {
    from: 'org-grapeshot',
    to: 'org-founders-factory',
    idea: 'consulting data tooling arc',
    strength: 1,
  },
  {
    from: 'org-founders-factory',
    to: 'org-reed-bi',
    idea: 'data preparation to strategy',
    strength: 1,
  },
  {
    from: 'org-reed-bi',
    to: 'org-bcw-global',
    idea: 'analytics workflow to planning prototype',
    strength: 1,
  },
  {
    from: 'org-bcw-global',
    to: 'org-wunderman-thompson',
    idea: 'prototype to production sql delivery',
    strength: 1,
  },
  {
    from: 'org-wunderman-thompson',
    to: 'org-toaster',
    idea: 'data engineering to experiment analytics',
    strength: 1,
  },
  {
    from: 'org-toaster',
    to: 'org-founders-forum',
    idea: 'analysis to migration and etl',
    strength: 1,
  },
  {
    from: 'org-founders-forum',
    to: 'org-jellyfish',
    idea: 'consulting to leadership',
    strength: 1,
  },
  {
    from: 'org-jellyfish',
    to: 'org-publicis-media',
    idea: 'bi leadership to enterprise scale',
    strength: 1,
  },
  {
    from: 'org-publicis-media',
    to: 'org-performics',
    idea: 'enterprise scale to innovation lab',
    strength: 1,
  },
] as const;

export const networkConfig = {
  nodes: networkNodes,
  ideas: networkIdeaEdges,
} as const;

export const networkLinks = {
  githubOrg: 'https://github.com/orgs/ai-knowledge-hub/repositories',
  githubPersonal: 'https://github.com/DG-creative-lab?tab=repositories',
  newsHub: 'https://ai-news-hub.performics-labs.com/',
  skillsHub: 'https://skills.ai-knowledge-hub.org/',
} as const;

export default networkConfig;
