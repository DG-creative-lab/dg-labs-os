import { dessiProfileProjection } from '../dessi';
import { definePublicResumeModule } from './validation';
import { PUBLIC_RESUME_SCHEMA_VERSION } from './contracts';

export const dessiResumeModule = definePublicResumeModule({
  schemaVersion: PUBLIC_RESUME_SCHEMA_VERSION,
  profileId: dessiProfileProjection.profileId,
  handle: dessiProfileProjection.handle,
  projectionVersion: dessiProfileProjection.projectionVersion,
  resumeVersion: 10,
  status: 'published',
  roleTitle: 'AI Systems Engineer · Enterprise Agents and Applied AI',
  summary: dessiProfileProjection.identity.introduction,
  contact: [
    { kind: 'public-email' },
    { kind: 'profile-link', linkId: 'linkedin' },
    { kind: 'profile-link', linkId: 'github-personal' },
    { kind: 'website', label: 'Portfolio' },
    { kind: 'profile-link', linkId: 'news-hub' },
  ],
  focusAreas: [
    {
      label: 'Customer discovery and productisation',
      detail:
        'Work with agency users to turn operational needs and integration constraints into reusable production workflows.',
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
    {
      label: 'Data engineering and API integration',
      detail:
        'Build API ingestion connectors, AWS Glue and Databricks ELT pipelines, and serving APIs. Validate schemas, freshness, completeness, and source-to-output reconciliation.',
    },
  ],
  selectedSystems: [
    {
      workbenchItemId: 'direct-acquisition-agent',
      evidenceClaimIds: [],
      workbenchHighlightIndexes: [0],
      primaryLink: 'repo',
      linkLabel: 'Repository',
    },
    {
      workbenchItemId: 'youtube-ad-agent',
      evidenceClaimIds: [],
      workbenchHighlightIndexes: [0],
      primaryLink: 'repo',
      linkLabel: 'Repository',
    },
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
      id: 'publicis-engineer',
      title: 'Engineer',
      organisation: 'Publicis Media',
      location: 'London',
      startedAt: '2023-11',
      endedAt: '2026-11',
      highlights: [
        'I architected the production Programmatic agent platform used by internal agency teams across three major global advertiser accounts and evolved it in response to agency feedback.',
      ],
      evidenceClaimIds: [
        'production-onboarding',
        'production-agent-runtime',
        'production-evaluation',
        'production-playbooks',
        'production-data-platform',
        'production-data-serving',
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
        'I turned recurring marketing reports into reusable datasets and decision-support services, building the API connectors and ELT pipelines that supplied them.',
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
        'I built interactive enterprise analytics applications backed by ingestion connectors, cloud ELT pipelines, and marketing data lakes.',
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
        'I worked directly with agency, startup, and media clients to deliver CRM, segmentation, analytics, and experimentation systems, including their ingestion connectors and ELT pipelines.',
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
    reviewedAt: '2026-11-10T00:00:00Z',
    publishedAt: '2026-11-10T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy:
      'Resume v10 includes only owner-reviewed public Profile, Workbench, and Evidence records selected in this module. Private and employer-confidential source material is excluded.',
  },
} as const);
