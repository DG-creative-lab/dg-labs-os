import { PROFILE_PROJECTION_SCHEMA_VERSION } from './contracts';
import { defineProfileProjection } from './validation';

export const dessiProfileProjection = defineProfileProjection({
  schemaVersion: PROFILE_PROJECTION_SCHEMA_VERSION,
  profileId: 'dessi_georgieva',
  handle: 'dessi',
  projectionVersion: 5,
  status: 'published',
  identity: {
    displayName: 'Dessi Georgieva',
    preferredName: 'Dessi',
    ownerName: 'Dessi Georgieva',
    aliases: ['Dessi', 'Dessi Georgieva', 'DG-OS', 'DG-Labs'],
    role: 'AI Systems Engineer',
    location: 'London, UK',
    roleFocus:
      'Building governed AI products and Human Systems Platform for AI-augmented career development, evidence-backed talent discovery, and opportunity research.',
    headline:
      'I design and build governed AI systems, including Human Systems Platform for learning from human-AI work and connecting evidenced capability to opportunities.',
    introduction:
      'My work spans open-source products, private founder development, and enterprise systems. I build the workflow around the agent, including the information it receives, the actions it may take, the checks applied to its work, and the points where a person should step in. Human Systems Platform applies that architecture to career and capability development: it learns from selected human-AI work, turns it into owner-approved evidence, helps individuals explore jobs, collaborators, funding, and next capabilities, and helps organisations discover relevant talent.',
  },
  contact: {
    publicEmail: 'dessi.georgieva8@gmail.com',
    website: 'https://dg-os.com/',
  },
  links: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/dessi-georgieva/',
      kind: 'profile',
      tags: ['linkedin', 'profile', 'experience', 'education', 'identity'],
      trust: 'high',
      surfaces: ['dock', 'verification', 'profile'],
    },
    {
      id: 'github-personal',
      label: 'GitHub',
      url: 'https://github.com/DG-creative-lab',
      kind: 'code',
      tags: ['github', 'repositories', 'projects', 'portfolio'],
      trust: 'high',
      surfaces: ['dock', 'verification', 'profile'],
    },
    {
      id: 'github-org',
      label: 'ai-knowledge-hub',
      url: 'https://github.com/ai-knowledge-hub',
      kind: 'code',
      tags: ['github', 'org', 'research', 'projects', 'ai-knowledge-hub'],
      trust: 'high',
      surfaces: ['verification', 'profile'],
    },
    {
      id: 'news-hub',
      label: 'AI News Hub',
      url: 'https://ai-news-hub.performics-labs.com/',
      kind: 'publication',
      tags: ['articles', 'writing', 'research', 'ai-news-hub'],
      trust: 'high',
      surfaces: ['verification', 'profile'],
    },
    {
      id: 'skills-hub',
      label: 'AI Skills Platform',
      url: 'https://skills.ai-knowledge-hub.org/',
      kind: 'platform',
      tags: ['skills', 'agents', 'tooling', 'platform'],
      trust: 'high',
      surfaces: ['verification', 'profile'],
    },
    {
      id: 'email',
      label: 'Email',
      url: 'mailto:dessi.georgieva8@gmail.com',
      kind: 'contact',
      tags: ['email', 'contact'],
      trust: 'high',
      surfaces: ['dock', 'profile'],
    },
  ],
  cv: {
    primary: {
      id: 'general',
      label: 'General CV',
      files: {
        pdf: '/cv/Dessi_Georgieva_CV.pdf',
        docx: '/cv/Dessi_Georgieva_CV.docx',
        markdown: '/cv/Dessi_Georgieva_CV.md',
      },
    },
    variants: [
      {
        id: 'openai-codex',
        label: 'OpenAI London application CV',
        files: {
          pdf: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.pdf',
          docx: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.docx',
          markdown: '/cv/Dessi_Georgieva_OpenAI_Codex_CV.md',
        },
      },
    ],
  },
  seo: {
    title: 'DG-OS - Dessi Georgieva',
    description:
      'Dessi Georgieva engineers governed agent systems and is developing Human Systems Platform for AI-augmented career development, evidence-backed talent discovery, and opportunity research.',
    keywords: [
      'Dessi Georgieva',
      'Applied AI Engineer',
      'Agent Systems',
      'LLM Evaluation',
      'DG-OS',
      'Human Systems Platform',
      'Opportunity Intelligence',
    ],
  },
  publication: {
    visibility: 'public',
    approvedBy: 'owner',
    reviewedAt: '2026-09-05T00:00:00Z',
    publishedAt: '2026-09-05T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Only owner-reviewed public claims and assets may enter this projection. Raw local and employer-confidential sources remain excluded.',
  },
} as const);
