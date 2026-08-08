import { describe, expect, it } from 'vitest';
import {
  createRejectedPublicationReceipt,
  isPublicationVerificationApiEnvelopeV1,
  isPublicationVerificationReceiptV1,
  PUBLICATION_VERIFICATION_MAX_ISSUES,
  PUBLICATION_VERIFICATION_MAX_MESSAGE_LENGTH,
  PUBLICATION_VERIFICATION_MAX_PATH_LENGTH,
  PUBLICATION_VERIFICATION_SCHEMA_VERSION,
  type PublicationVerificationReceiptV1,
} from '../../src/publication';
import {
  publicationVerificationApiEnvelopeV1Fixture,
  rejectedPublicationReceiptV1Fixture,
  verifiedPublicationReceiptV1Fixture,
} from '../fixtures/contracts/publicationVerificationV1';

describe('Publication Verification v1 contract', () => {
  it('keeps committed verified and rejected receipts valid and serialisable', () => {
    expect(PUBLICATION_VERIFICATION_SCHEMA_VERSION).toBe('dg-os.publication-verification/v1');
    expect(isPublicationVerificationReceiptV1(verifiedPublicationReceiptV1Fixture)).toBe(true);
    expect(isPublicationVerificationReceiptV1(rejectedPublicationReceiptV1Fixture)).toBe(true);
    expect(
      isPublicationVerificationApiEnvelopeV1(publicationVerificationApiEnvelopeV1Fixture)
    ).toBe(true);
    expect(JSON.parse(JSON.stringify(publicationVerificationApiEnvelopeV1Fixture))).toEqual(
      publicationVerificationApiEnvelopeV1Fixture
    );
  });

  it('rejects unknown fields and incomplete check sets', () => {
    const unknownField = { ...verifiedPublicationReceiptV1Fixture, payload: 'not-allowed' };
    const incompleteChecks = {
      ...verifiedPublicationReceiptV1Fixture,
      checks: { ...verifiedPublicationReceiptV1Fixture.checks, signature: undefined },
    };

    expect(isPublicationVerificationReceiptV1(unknownField)).toBe(false);
    expect(isPublicationVerificationReceiptV1(incompleteChecks)).toBe(false);
  });

  it('bounds rejected issues and replaces unapproved diagnostics', () => {
    const sensitiveMarker = `customer-secret-${'x'.repeat(500)}`;
    const issues = Array.from({ length: PUBLICATION_VERIFICATION_MAX_ISSUES + 10 }, (_, index) => ({
      path: index === 0 ? `approval.${sensitiveMarker}` : `records[${index}]`,
      message: index === 0 ? sensitiveMarker : 'Invalid record.',
    }));
    const receipt = createRejectedPublicationReceipt('INVALID_BUNDLE', issues);

    expect(receipt.issues).toHaveLength(PUBLICATION_VERIFICATION_MAX_ISSUES);
    expect(receipt.truncated).toBe(true);
    expect(receipt.issues[0]).toEqual({
      path: 'approval',
      message: 'Publication data is invalid.',
    });
    expect(JSON.stringify(receipt)).not.toContain(sensitiveMarker);
    expect(
      receipt.issues.every((issue) => issue.path.length <= PUBLICATION_VERIFICATION_MAX_PATH_LENGTH)
    ).toBe(true);
    expect(
      receipt.issues.every(
        (issue) => issue.message.length <= PUBLICATION_VERIFICATION_MAX_MESSAGE_LENGTH
      )
    ).toBe(true);
  });

  it('keeps compile-time compatibility tied to the complete receipt union', () => {
    const verified: PublicationVerificationReceiptV1 = verifiedPublicationReceiptV1Fixture;
    const rejected: PublicationVerificationReceiptV1 = rejectedPublicationReceiptV1Fixture;
    expect(verified.status).toBe('verified');
    expect(rejected.status).toBe('rejected');
  });
});
