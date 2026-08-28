import { dessiProfileProjection } from '../dessi';
import { definePublicResumeModule } from './validation';
import { PUBLIC_RESUME_SCHEMA_VERSION } from './contracts';

export const dessiResumeModule = definePublicResumeModule({
  schemaVersion: PUBLIC_RESUME_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  resumeVersion: 6,
  status: 'published',
  roleTitle: 'AI Systems Engineer',
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
      label: 'AI operating environments',
      detail:
        'Design the people, agents, tools, data, rules, and surrounding systems that must work together to produce a useful result.',
    },
    {
      label: 'Context, memory, and capabilities',
      detail:
        'Give agents the right information and reusable procedures for each task, with clear sources, scope, and limits.',
    },
    {
      label: 'Authority and human attention',
      detail:
        'Define what an agent may decide, when it must ask, and how identity, permissions, approvals, and consequential actions stay under human and system control.',
    },
    {
      label: 'Evaluation and learning',
      detail:
        'Test components, interactions, and end results, then turn failures, feedback, and observed outcomes into changes that can be reviewed and reversed.',
    },
    {
      label: 'Reliability and recovery',
      detail:
        'Make long-running work observable and recoverable through explicit state, budgets, retries, receipts, fallback, cancellation, and rollback.',
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
      workbenchHighlightIndexes: [3],
      primaryLink: 'site',
      linkLabel: 'Public overview',
    },
    {
      workbenchItemId: 'human-systems-platform',
      evidenceClaimIds: ['human-systems-platform'],
      workbenchHighlightIndexes: [2],
      primaryLink: 'site',
      linkLabel: 'First public product',
    },
    {
      workbenchItemId: 'learning-foundry',
      evidenceClaimIds: ['codex-capability'],
      workbenchHighlightIndexes: [],
      primaryLink: 'repo',
      linkLabel: 'Repository at submitted commit',
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
        'I map production request-to-response lifecycles and am leading architecture work for evidence-led final-answer validation; this remains in delivery rather than a deployed control.',
      ],
      evidenceClaimIds: [
        'production-agent-platform',
        'production-data-platform',
        'production-backend',
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
        'I delivered CRM, analytics, segmentation, automation, and experimentation systems for agencies, startups, and media organisations.',
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
    reviewedAt: '2026-08-28T00:00:00Z',
    publishedAt: '2026-08-28T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Resume v6 includes only owner-reviewed public Profile, Workbench, and Evidence records selected in this module. Private and employer-confidential source material is excluded.',
  },
} as const);
