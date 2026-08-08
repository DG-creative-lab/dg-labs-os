import type { PublicationBundleV1 } from '../contracts';
import { verifyPublicationBundle } from '../crypto';
import { validatePublicationBundle } from '../validation';
import {
  createRejectedPublicationReceipt,
  createVerifiedPublicationReceipt,
  type PublicationVerificationReceiptV1,
} from '../verification';
import type { PublicationVerificationTrustStore } from './trustStore';

export function verifyPublicationForReceiver(
  candidate: unknown,
  trustStore: PublicationVerificationTrustStore
): PublicationVerificationReceiptV1 {
  const validationIssues = validatePublicationBundle(candidate);
  if (validationIssues.length) {
    return createRejectedPublicationReceipt('INVALID_BUNDLE', validationIssues);
  }

  const bundle = candidate as PublicationBundleV1;
  const verificationKey = trustStore.resolve({
    workspaceId: bundle.workspaceId,
    profileId: bundle.target.profileId,
    handle: bundle.target.handle,
    approvedByUserId: bundle.approval.approvedByUserId,
    keyId: bundle.integrity.keyId,
  });
  if (!verificationKey) {
    return createRejectedPublicationReceipt('UNTRUSTED_SIGNING_KEY', [
      {
        path: 'integrity.keyId',
        message: 'No trusted signing key matches the complete publication identity boundary.',
      },
    ]);
  }

  const cryptographicResult = verifyPublicationBundle(bundle, verificationKey);
  if (!cryptographicResult.valid) {
    return createRejectedPublicationReceipt(
      'CRYPTOGRAPHIC_VERIFICATION_FAILED',
      cryptographicResult.issues
    );
  }

  return createVerifiedPublicationReceipt(bundle, cryptographicResult.digest);
}
