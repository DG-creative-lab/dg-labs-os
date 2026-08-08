import type {
  PublicationVerificationApiEnvelopeV1,
  RejectedPublicationReceiptV1,
  VerifiedPublicationReceiptV1,
} from '../../../src/publication';
import { publicationBundleV1Fixture } from './publicationBundleV1';

export const verifiedPublicationReceiptV1Fixture = {
  schemaVersion: 'dg-os.publication-verification/v1',
  status: 'verified',
  subject: {
    bundleId: publicationBundleV1Fixture.bundleId,
    workspaceId: publicationBundleV1Fixture.workspaceId,
    profileId: publicationBundleV1Fixture.target.profileId,
    handle: publicationBundleV1Fixture.target.handle,
    proposedProjectionVersion: publicationBundleV1Fixture.target.proposedProjectionVersion,
  },
  integrity: {
    keyId: publicationBundleV1Fixture.integrity.keyId,
    digest: publicationBundleV1Fixture.integrity.digest,
  },
  checks: {
    schema: 'passed',
    privacy: 'passed',
    identity: 'passed',
    referenceMetadata: 'passed',
    digest: 'passed',
    signature: 'passed',
  },
} as const satisfies VerifiedPublicationReceiptV1;

export const rejectedPublicationReceiptV1Fixture = {
  schemaVersion: 'dg-os.publication-verification/v1',
  status: 'rejected',
  code: 'UNTRUSTED_SIGNING_KEY',
  issues: [
    {
      path: 'integrity.keyId',
      message: 'No trusted signing key matches the complete publication identity boundary.',
    },
  ],
  truncated: false,
} as const satisfies RejectedPublicationReceiptV1;

export const publicationVerificationApiEnvelopeV1Fixture = {
  ok: true,
  verification: verifiedPublicationReceiptV1Fixture,
} as const satisfies PublicationVerificationApiEnvelopeV1;
