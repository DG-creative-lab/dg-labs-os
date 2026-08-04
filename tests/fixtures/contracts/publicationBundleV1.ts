import type { PublicationBundlePayloadV1, PublicationBundleV1 } from '../../../src/publication';

export const publicationBundlePayloadV1Fixture = {
  schemaVersion: 'dg-os.publication-bundle/v1',
  bundleId: '11111111-1111-4111-8111-111111111111',
  workspaceId: 'workspace_contract_fixture',
  target: {
    profileId: 'contract_fixture',
    handle: 'contract-fixture',
    baseProjectionVersion: 1,
    proposedProjectionVersion: 2,
  },
  createdAt: '2026-08-04T08:00:00Z',
  preparedBy: {
    kind: 'human',
    actorId: 'user_contract_fixture',
    provider: null,
    client: 'manual',
  },
  records: [
    {
      kind: 'profile',
      schemaVersion: 'dg-os.profile-projection/v1',
      recordId: 'profile-v2',
      profileId: 'contract_fixture',
      handle: 'contract-fixture',
      projectionVersion: 2,
      recordVersion: 2,
      sha256: '1'.repeat(64),
      byteLength: 4096,
    },
    {
      kind: 'profile-modules',
      schemaVersion: 'dg-os.profile-modules/v1',
      recordId: 'profile-modules-v2',
      profileId: 'contract_fixture',
      handle: 'contract-fixture',
      projectionVersion: 2,
      recordVersion: 2,
      sha256: '2'.repeat(64),
      byteLength: 8192,
    },
    {
      kind: 'network',
      schemaVersion: 'dg-os.profile-network/v1',
      recordId: 'network-v2',
      profileId: 'contract_fixture',
      handle: 'contract-fixture',
      projectionVersion: 2,
      recordVersion: 2,
      sha256: '3'.repeat(64),
      byteLength: 6144,
    },
    {
      kind: 'writing',
      schemaVersion: 'dg-os.profile-writing/v1',
      recordId: 'writing-v2',
      profileId: 'contract_fixture',
      handle: 'contract-fixture',
      projectionVersion: 2,
      recordVersion: 2,
      sha256: '4'.repeat(64),
      byteLength: 3072,
    },
    {
      kind: 'resume',
      schemaVersion: 'dg-os.profile-resume/v1',
      recordId: 'resume-v2',
      profileId: 'contract_fixture',
      handle: 'contract-fixture',
      projectionVersion: 2,
      recordVersion: 2,
      sha256: '5'.repeat(64),
      byteLength: 2048,
    },
  ],
  assets: [
    {
      assetId: 'general-cv-pdf-v2',
      mediaType: 'application/pdf',
      sha256: '6'.repeat(64),
      byteLength: 32768,
    },
  ],
  approval: {
    approvedByUserId: 'user_contract_fixture',
    approvedAt: '2026-08-04T08:05:00Z',
    method: 'local-signature',
  },
} as const satisfies PublicationBundlePayloadV1;

// Synthetic public key and signature generated only for the immutable v1 fixture.
// No private key or production identity is associated with this material.
export const publicationBundleV1FixturePublicKey = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA9gheUr6pehldp98+VjMPw6CrqWWSQrKo0VfhUhITdnI=
-----END PUBLIC KEY-----
`;

export const publicationBundleV1Fixture = {
  ...publicationBundlePayloadV1Fixture,
  integrity: {
    canonicalization: 'rfc8785',
    digestAlgorithm: 'sha256',
    signatureAlgorithm: 'ed25519',
    keyId: 'key_contract_fixture',
    digest: 'acb57742126744b3d602223d3ccd6628c4ba54f83ac151fe68beaae59a8c4683',
    signature:
      'bOOh45MNSIr49cjI/BIXXE2DQW0o+dp3PLQUAZI7mSCIC52Qp42T6E6070OiaAH9Q/4Wqd+7b4Uu+9ifFzJxCg==',
  },
} as const satisfies PublicationBundleV1;
