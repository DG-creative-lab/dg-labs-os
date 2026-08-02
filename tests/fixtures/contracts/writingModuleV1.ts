import type { PublicWritingModule } from '../../../src/profiles/writing';

export const writingModuleV1Fixture = {
  schemaVersion: 'dg-os.profile-writing/v1',
  profileId: 'contract_fixture',
  handle: 'contract-fixture',
  projectionVersion: 1,
  writingVersion: 1,
  status: 'published',
  title: 'Fixture Writing',
  description: 'Synthetic public writing for compatibility testing.',
  entries: [
    {
      id: 'fixture-writing',
      kind: 'Technical analysis',
      title: 'Writing Contract Fixture',
      subtitle: 'A portable record for the public Writing v1 contract.',
      readingTime: '4 min',
      publishedOn: '2026-08-02',
      reviewedOn: '2026-08-02',
      status: 'published',
      url: 'https://example.com/fixture-writing',
      topics: ['contracts', 'writing'],
      relatedSystem: 'Fixture System',
      boundary: 'This synthetic entry does not represent a real publication.',
      authorship: {
        byline: 'Fixture Publisher',
        contribution: 'Synthetic contribution used only for compatibility testing.',
        contributionConfidence: 'verified',
      },
      evidence: [
        {
          label: 'Fixture article',
          url: 'https://example.com/fixture-writing',
          kind: 'article',
        },
      ],
    },
  ],
  archive: {
    label: 'Fixture archive',
    url: 'https://example.com/archive',
    boundary: 'The archive contains synthetic test records only.',
  },
  publication: {
    approvedBy: 'owner',
    reviewedAt: '2026-08-02T00:00:00Z',
    publishedAt: '2026-08-02T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy: 'Synthetic public fixture data only.',
  },
} as const satisfies PublicWritingModule;
