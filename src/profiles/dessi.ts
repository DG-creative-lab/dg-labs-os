import { PROFILE_PROJECTION_SCHEMA_VERSION } from './contracts';
import { defineProfileProjection } from './validation';

export const dessiProfileProjection = defineProfileProjection({
  schemaVersion: PROFILE_PROJECTION_SCHEMA_VERSION,
  profileId: 'dessi_georgieva',
  handle: 'dessi',
  projectionVersion: 6,
  status: 'published',
  identity: {
    displayName: 'Dessi Georgieva',
    preferredName: 'Dessi',
    ownerName: 'Dessi Georgieva',
    aliases: ['Dessi', 'Dessi Georgieva', 'DG-OS', 'DG-Labs'],
    role: 'AI Systems Engineer',
    location: 'London, UK',
    roleFocus:
      'Agent architecture, tool and data integration, evaluation, and production delivery.',
    headline: 'I take enterprise AI systems into production.',
    introduction:
      'I’m an AI systems engineer with a background in consulting, business intelligence, and enterprise engineering. I design agent workflows, connect them to tools and data, and build in evaluation and human approvals. My production work has focused on multi-tenant systems for marketing and advertising.',
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
      label: 'AI Knowledge Hub',
      url: 'https://ai-knowledge-hub.org/',
      kind: 'publication',
      tags: ['writing', 'research', 'marketing', 'growth', 'go-to-market', 'ai-knowledge-hub'],
      trust: 'high',
      surfaces: ['verification', 'profile'],
    },
    {
      id: 'skills-hub',
      label: 'AI Knowledge Hub Skills',
      url: 'https://skills.ai-knowledge-hub.org/',
      kind: 'platform',
      tags: ['skills', 'agents', 'tooling', 'platform'],
      trust: 'high',
      surfaces: ['verification', 'profile'],
    },
    {
      id: 'harness-lab',
      label: 'AI Knowledge Hub Harness',
      url: 'https://harness.ai-knowledge-hub.org/',
      kind: 'platform',
      tags: ['harness', 'system design', 'algorithms', 'engineering'],
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
      'Dessi Georgieva is an AI systems engineer with production experience in agent workflows, tool and data integration, and evaluation. Her background spans consulting, business intelligence, and enterprise engineering.',
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
    reviewedAt: '2026-11-10T00:00:00Z',
    publishedAt: '2026-11-10T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Only owner-reviewed public claims and assets may enter this projection. Raw local and employer-confidential sources remain excluded.',
  },
} as const);
