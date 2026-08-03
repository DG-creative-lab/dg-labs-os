import type { PublicResumeModule } from '../../../src/profiles/resume';

export const resumeModuleV1Fixture = {
  schemaVersion: 'dg-os.profile-resume/v1',
  profileId: 'contract_fixture',
  handle: 'contract-fixture',
  projectionVersion: 1,
  resumeVersion: 1,
  status: 'published',
  roleTitle: 'Systems Builder',
  summary: 'Synthetic approved Resume data used to preserve contract compatibility.',
  contact: [
    { kind: 'public-email' },
    { kind: 'profile-link', linkId: 'fixture-profile' },
    { kind: 'website', label: 'Profile site' },
  ],
  focusAreas: [
    { label: 'System boundaries', detail: 'contracts, validation, deterministic views' },
  ],
  selectedSystems: [
    {
      workbenchItemId: 'fixture-system',
      evidenceClaimIds: ['fixture-claim'],
      workbenchHighlightIndexes: [0],
      primaryLink: 'repo',
      linkLabel: 'Repository',
    },
  ],
  experience: [
    {
      id: 'fixture-role',
      title: 'Fixture Engineer',
      organisation: 'Fixture Organisation',
      location: 'London',
      startedAt: '2025-01',
      endedAt: null,
      highlights: ['Built a synthetic profile-isolation fixture.'],
      evidenceClaimIds: ['fixture-claim'],
      boundary: 'This is synthetic test data, not a real employment claim.',
    },
  ],
  education: [
    {
      id: 'fixture-education',
      qualification: 'Fixture Systems Certificate',
      institution: 'Example Institute',
      startedAt: '2024',
      endedAt: '2025',
    },
  ],
  publication: {
    approvedBy: 'owner',
    reviewedAt: '2026-08-02T00:00:00Z',
    publishedAt: '2026-08-02T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy: 'Synthetic public fixture data only.',
  },
} as const satisfies PublicResumeModule;
