import { dessiProfileProjection } from '../dessi';
import { definePublicResumeModule } from './validation';
import { PUBLIC_RESUME_SCHEMA_VERSION } from './contracts';

export const dessiResumeModule = definePublicResumeModule({
  schemaVersion: PUBLIC_RESUME_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  resumeVersion: 9,
  status: 'published',
  roleTitle: 'AI Systems Engineer · Enterprise Agents and Applied AI',
  summary:
    'I architect and build enterprise AI systems that interpret user intent, coordinate skills and tools, work across hierarchical external systems, and return results under explicit identity, policy, and evidence controls. My professional work provides production backend, data, and multi-tenant experience; my independent systems make the corresponding architecture, evaluation, and recovery patterns inspectable.',
  contact: [
    { kind: 'public-email' },
    { kind: 'profile-link', linkId: 'linkedin' },
    { kind: 'profile-link', linkId: 'github-personal' },
    { kind: 'website', label: 'Portfolio' },
    { kind: 'profile-link', linkId: 'github-org' },
  ],
  focusAreas: [
    {
      label: 'Customer discovery and productisation',
      detail:
        'Translate operational needs, user feedback, and integration constraints into prototypes that can become reusable production capabilities.',
    },
    {
      label: 'Agent architecture and integration',
      detail:
        'Connect model reasoning to skills, typed tools, cloud services, provider APIs, retrieval, and analytical data without making each new intent a bespoke workflow.',
    },
    {
      label: 'Evaluation and observability',
      detail:
        'Measure routing, correctness, grounding, tool use, latency, and cost, then use traces and user feedback to diagnose failures and prevent regression.',
    },
    {
      label: 'Cloud delivery and reliability',
      detail:
        'Ship through automated environments with explicit deployment checks, smoke tests, runtime monitoring, rollback, and recovery paths.',
    },
    {
      label: 'Authority and safety',
      detail:
        'Keep tenant scope, permissions, approvals, evidence, provider writes, and consequential effects under deterministic control while models interpret and propose.',
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
      workbenchItemId: 'gateplane-enterprise-auth',
      evidenceClaimIds: ['gateplane-control-plane'],
      workbenchHighlightIndexes: [2],
      primaryLink: 'site',
      linkLabel: 'Public overview',
    },
    {
      workbenchItemId: 'dg-os',
      evidenceClaimIds: ['provider-runtime'],
      workbenchHighlightIndexes: [0],
      primaryLink: 'repo',
      linkLabel: 'Repository',
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
        'I architected and evolved a production Programmatic agent platform used by internal agency teams across three major global advertiser accounts, taking it from prototype through changing engineering and user requirements.',
      ],
      evidenceClaimIds: [
        'production-agent-runtime',
        'production-onboarding',
        'production-evaluation',
        'production-playbooks',
        'production-data-platform',
      ],
      boundary:
        'I describe employer work only at responsibility and outcome level. Employer code, client information, operational measurements, and infrastructure remain confidential.',
    },
    {
      id: 'publicis-senior-bi',
      title: 'Senior Business Intelligence Analyst',
      organisation: 'Publicis Media',
      location: 'London',
      startedAt: '2023-03',
      endedAt: '2023-11',
      highlights: [
        'I bridged marketing analytics and decision systems, moving reporting workflows toward reusable intelligence services and platformised decision support.',
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
        'I built enterprise analytics applications and data workflows, including interactive products, cloud ETL, and data-lake patterns.',
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
        'I worked directly with agency, startup, and media clients to translate business requirements into CRM, analytics, segmentation, automation, and experimentation systems.',
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
    approvedBy: 'owner',
    reviewedAt: '2026-09-21T00:00:00Z',
    publishedAt: '2026-09-21T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Resume v9 includes only owner-reviewed public Profile, Workbench, and Evidence records selected in this module. Private and employer-confidential source material is excluded.',
  },
} as const);
