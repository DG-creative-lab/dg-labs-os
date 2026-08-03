import { dessiProfileProjection } from '../dessi';
import { definePublicResumeModule } from './validation';
import { PUBLIC_RESUME_SCHEMA_VERSION } from './contracts';

export const dessiResumeModule = definePublicResumeModule({
  schemaVersion: PUBLIC_RESUME_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  resumeVersion: 1,
  status: 'published',
  roleTitle: 'AI Systems Engineer',
  summary:
    'AI systems engineer building the layer between models and dependable products: tool execution, context construction, evaluation, evidence, failure recovery, and human control. I work primarily in Python, FastAPI, TypeScript, React, and AWS. My public projects explore how agent systems can learn while keeping decisions and provenance inspectable; my employer work includes backend services, data workflows, and multi-tenant platform infrastructure.',
  contact: [
    { kind: 'public-email' },
    { kind: 'profile-link', linkId: 'linkedin' },
    { kind: 'profile-link', linkId: 'github-personal' },
    { kind: 'website', label: 'Portfolio' },
    { kind: 'profile-link', linkId: 'github-org' },
  ],
  focusAreas: [
    {
      label: 'Agent systems',
      detail:
        'tool-use policy, execution state, approvals, idempotency, recovery, provider adapters, retrieval, streaming',
    },
    {
      label: 'Evaluation and learning',
      detail:
        'regression suites, deterministic replay, synthetic and observed validation, evidence ledgers, belief revision',
    },
    {
      label: 'Backend and data',
      detail: 'Python, FastAPI, Pydantic, pytest, SQL, PostgreSQL, embeddings, clustering',
    },
    {
      label: 'Product and infrastructure',
      detail: 'TypeScript, React, Next.js, Astro, Node.js, AWS, Terraform, Docker, CI/CD',
    },
  ],
  selectedSystems: [
    {
      workbenchItemId: 'agentic-commerce-loop',
      evidenceClaimIds: ['agent-runtime', 'feedback-loop'],
      workbenchHighlightIndexes: [],
      primaryLink: 'repo',
      linkLabel: 'Repository',
    },
    {
      workbenchItemId: 'learning-foundry',
      evidenceClaimIds: ['codex-capability'],
      workbenchHighlightIndexes: [0],
      primaryLink: 'repo',
      linkLabel: 'Repository at submitted commit',
    },
    {
      workbenchItemId: 'dg-os',
      evidenceClaimIds: ['provider-runtime'],
      workbenchHighlightIndexes: [2],
      primaryLink: 'site',
      linkLabel: 'Portfolio',
    },
  ],
  experience: [
    {
      id: 'performics-engineer',
      title: 'Engineer',
      organisation: 'Performics Innovations Lab · Publicis Media',
      location: 'London',
      startedAt: '2023-11',
      endedAt: null,
      highlights: [
        'Design and build AI and data systems spanning FastAPI services, AWS workflows, multi-tenant platform controls, behavioural modelling, and marketing-intelligence interfaces.',
      ],
      evidenceClaimIds: ['production-backend'],
      boundary:
        'Employer code, client information, operational measurements, and infrastructure remain confidential; public descriptions are intentionally limited to responsibilities and outcomes.',
    },
    {
      id: 'publicis-senior-bi',
      title: 'Senior Business Intelligence Analyst',
      organisation: 'Publicis Media',
      location: 'London',
      startedAt: '2023-03',
      endedAt: '2023-11',
      highlights: [
        'Bridged marketing analytics and decision systems, moving reporting workflows toward reusable intelligence services and platformised decision support.',
      ],
      evidenceClaimIds: [],
    },
    {
      id: 'jellyfish-bi-manager',
      title: 'Business Intelligence Manager',
      organisation: 'Jellyfish',
      location: 'London',
      startedAt: '2021-01',
      endedAt: '2023-03',
      highlights: [
        'Built enterprise analytics applications and data workflows, including Shiny applications, AWS ETL, and data-lake patterns.',
      ],
      evidenceClaimIds: [],
    },
    {
      id: 'selected-data-contracts',
      title: 'Data Consultant / SQL Developer / Data Analyst',
      organisation: 'Selected contracts',
      location: 'London',
      startedAt: '2017',
      endedAt: '2020',
      highlights: [
        'Delivered CRM, analytics, segmentation, automation, and experimentation systems for agencies, startups, and media organisations.',
      ],
      evidenceClaimIds: [],
    },
  ],
  education: [
    {
      id: 'york-human-rights',
      qualification: 'MA Applied Human Rights',
      institution: 'University of York',
      startedAt: '2009',
      endedAt: '2011',
    },
    {
      id: 'sofia-philosophy',
      qualification: 'BA Philosophy, specialising in Philosophy of Science',
      institution: 'Sofia University',
      startedAt: '2003',
      endedAt: '2007',
    },
  ],
  publication: {
    approvedBy: dessiProfileProjection.publication.approvedBy,
    reviewedAt: dessiProfileProjection.publication.reviewedAt,
    publishedAt: dessiProfileProjection.publication.publishedAt,
    privateSourcesExcluded: dessiProfileProjection.publication.privateSourcesExcluded,
    sourcePolicy: dessiProfileProjection.publication.sourcePolicy,
  },
} as const);
