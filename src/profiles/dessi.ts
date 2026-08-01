import { PROFILE_PROJECTION_SCHEMA_VERSION } from './contracts';
import { defineProfileProjection } from './validation';

export const dessiProfileProjection = defineProfileProjection({
  schemaVersion: PROFILE_PROJECTION_SCHEMA_VERSION,
  profileId: 'dessi_georgieva',
  handle: 'dessi',
  projectionVersion: 1,
  status: 'published',
  identity: {
    displayName: 'Dessi Georgieva',
    preferredName: 'Dessi',
    ownerName: 'Dessi Georgieva',
    aliases: ['Dessi', 'Dessi Georgieva', 'DG-OS', 'DG-Labs'],
    role: 'AI Systems Engineer',
    location: 'London, UK',
    roleFocus:
      'Building inspectable agent systems, evaluation loops, and human-controlled AI infrastructure.',
    headline: 'I build the layer where agent capability becomes accountable behaviour.',
    introduction:
      'My work sits between models and use: tool execution, context, evidence, failure recovery, human control, and the feedback loops that make the next run better.',
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
      sourcePath: '/src/data/resume/cv.md',
    },
    variants: [],
  },
  seo: {
    title: 'DG-OS - Dessi Georgieva',
    description:
      'Dessi Georgieva builds agent systems, evaluation loops, and human-controlled AI infrastructure.',
    keywords: [
      'Dessi Georgieva',
      'Applied AI Engineer',
      'Agent Systems',
      'LLM Evaluation',
      'DG-OS',
    ],
  },
  publication: {
    visibility: 'public',
    approvedBy: 'owner',
    reviewedAt: '2026-08-01T00:00:00Z',
    publishedAt: '2026-08-01T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Only owner-reviewed public claims and assets may enter this projection. Raw local and employer-confidential sources remain excluded.',
  },
} as const);
