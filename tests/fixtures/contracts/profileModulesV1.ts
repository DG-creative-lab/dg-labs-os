import type { PublicProfileModules } from '../../../src/profiles/modules';

export const profileModulesV1Fixture = {
  schemaVersion: 'dg-os.profile-modules/v1',
  profileId: 'contract_fixture',
  handle: 'contract-fixture',
  projectionVersion: 1,
  modulesVersion: 1,
  status: 'published',
  workbench: {
    moduleId: 'workbench',
    moduleVersion: 1,
    categories: ['Fixture Systems'],
    categoryDescriptions: {
      'Fixture Systems': 'Synthetic systems for compatibility testing.',
    },
    items: [
      {
        id: 'fixture-system',
        category: 'Fixture Systems',
        classification: 'Synthetic public system',
        title: 'Contract System',
        subtitle: 'A portable Workbench record',
        summary: 'Exercises the versioned profile-module contract.',
        stack: ['TypeScript'],
        links: {
          repo: 'https://example.com/contract-system',
        },
        highlights: ['Remains valid for the lifetime of the v1 schema.'],
      },
    ],
  },
  evidenceEvolution: {
    moduleId: 'evidence-evolution',
    moduleVersion: 1,
    claims: [
      {
        id: 'fixture-claim',
        statement: 'The v1 contract fixture is accepted by the current validator.',
        confidence: 'verified',
        visibility: 'public',
        lastVerified: '2026-08-02',
        evidence: [
          {
            label: 'Fixture evidence',
            url: 'https://example.com/fixture-evidence',
            kind: 'site',
          },
        ],
      },
    ],
    caseStudies: [
      {
        id: 'fixture-study',
        title: 'Contract Compatibility Study',
        classification: 'Synthetic public case study',
        contribution: 'Defined a portable v1 fixture.',
        problem: 'Schema changes can silently break old public bundles.',
        intervention: 'Keep a committed compatibility fixture.',
        evaluation: 'Run it through every current validator and registry.',
        result: 'Breaking changes fail before publication.',
        limitation: 'The fixture protects contract behaviour, not every content decision.',
        roleSignals: ['contract design'],
        evidence: [
          {
            label: 'Compatibility evidence',
            url: 'https://example.com/compatibility-evidence',
            kind: 'site',
          },
        ],
      },
    ],
    boundaries: ['Synthetic fixtures do not represent a real person.'],
    entries: [
      {
        date: '2026-08-02',
        kind: 'experiment',
        title: 'Contract fixture introduced',
        summary: 'A committed bundle now protects v1 compatibility.',
        state: 'reviewed',
        evidenceIds: ['fixture-claim'],
      },
    ],
  },
  publication: {
    approvedBy: 'owner',
    reviewedAt: '2026-08-02T00:00:00Z',
    publishedAt: '2026-08-02T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy: 'Synthetic public fixture data only.',
  },
} as const satisfies PublicProfileModules;
