import type { ProfileProjection } from '../../../src/profiles';

export const profileProjectionV1Fixture = {
  schemaVersion: 'dg-os.profile-projection/v1',
  profileId: 'contract_fixture',
  handle: 'contract-fixture',
  projectionVersion: 1,
  status: 'published',
  identity: {
    displayName: 'Contract Fixture',
    preferredName: 'Fixture',
    ownerName: 'Contract Fixture',
    aliases: ['Fixture Human'],
    role: 'Systems Builder',
    location: 'London, UK',
    roleFocus: 'Inspectable systems',
    headline: 'A portable public profile contract.',
    introduction: 'Synthetic data used to preserve profile projection compatibility.',
  },
  contact: {
    publicEmail: 'fixture@example.com',
    website: 'https://example.com/',
  },
  links: [
    {
      id: 'fixture-profile',
      label: 'Fixture profile',
      url: 'https://example.com/profile',
      kind: 'profile',
      tags: ['fixture'],
      trust: 'high',
      surfaces: ['profile', 'verification'],
    },
  ],
  cv: {
    primary: {
      id: 'general',
      label: 'General CV',
      files: {
        pdf: '/cv/Contract_Fixture_CV.pdf',
        docx: '/cv/Contract_Fixture_CV.docx',
        markdown: '/cv/Contract_Fixture_CV.md',
      },
    },
    variants: [],
  },
  seo: {
    title: 'Contract Fixture',
    description: 'Portable profile contract fixture.',
    keywords: ['contract', 'fixture'],
  },
  publication: {
    visibility: 'public',
    approvedBy: 'owner',
    reviewedAt: '2026-08-02T00:00:00Z',
    publishedAt: '2026-08-02T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy: 'Synthetic public fixture data only.',
  },
} as const satisfies ProfileProjection;
