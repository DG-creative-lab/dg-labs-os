import type { PublicationBundleIssue, PublicationBundleV1 } from './contracts';

export const PUBLICATION_VERIFICATION_SCHEMA_VERSION = 'dg-os.publication-verification/v1' as const;
export const PUBLICATION_VERIFICATION_MAX_ISSUES = 25;

export type PublicationVerificationSchemaVersion = typeof PUBLICATION_VERIFICATION_SCHEMA_VERSION;
export type PublicationVerificationRejectionCode =
  | 'INVALID_BUNDLE'
  | 'UNTRUSTED_SIGNING_KEY'
  | 'CRYPTOGRAPHIC_VERIFICATION_FAILED';

export type PublicationVerificationChecks = {
  schema: 'passed';
  privacy: 'passed';
  identity: 'passed';
  referenceMetadata: 'passed';
  digest: 'passed';
  signature: 'passed';
};

export type VerifiedPublicationReceiptV1 = {
  schemaVersion: PublicationVerificationSchemaVersion;
  status: 'verified';
  subject: {
    bundleId: string;
    workspaceId: string;
    profileId: string;
    handle: string;
    proposedProjectionVersion: number;
  };
  integrity: {
    keyId: string;
    digest: string;
  };
  checks: PublicationVerificationChecks;
};

export type RejectedPublicationReceiptV1 = {
  schemaVersion: PublicationVerificationSchemaVersion;
  status: 'rejected';
  code: PublicationVerificationRejectionCode;
  issues: readonly PublicationBundleIssue[];
  truncated: boolean;
};

export type PublicationVerificationReceiptV1 =
  | VerifiedPublicationReceiptV1
  | RejectedPublicationReceiptV1;

export type PublicationVerificationApiEnvelopeV1 = {
  ok: true;
  verification: PublicationVerificationReceiptV1;
};

const REJECTION_CODES = new Set<PublicationVerificationRejectionCode>([
  'INVALID_BUNDLE',
  'UNTRUSTED_SIGNING_KEY',
  'CRYPTOGRAPHIC_VERIFICATION_FAILED',
]);
const CHECK_NAMES = [
  'schema',
  'privacy',
  'identity',
  'referenceMetadata',
  'digest',
  'signature',
] as const;
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
};

const isStableId = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 128 && ID_PATTERN.test(value);

function validateVerifiedReceipt(value: Record<string, unknown>): boolean {
  if (!hasExactKeys(value, ['schemaVersion', 'status', 'subject', 'integrity', 'checks'])) {
    return false;
  }
  if (!isRecord(value.subject) || !isRecord(value.integrity) || !isRecord(value.checks)) {
    return false;
  }
  const checks = value.checks;
  if (
    !hasExactKeys(value.subject, [
      'bundleId',
      'workspaceId',
      'profileId',
      'handle',
      'proposedProjectionVersion',
    ]) ||
    !hasExactKeys(value.integrity, ['keyId', 'digest']) ||
    !hasExactKeys(value.checks, CHECK_NAMES)
  ) {
    return false;
  }
  return (
    typeof value.subject.bundleId === 'string' &&
    UUID_V4_PATTERN.test(value.subject.bundleId) &&
    isStableId(value.subject.workspaceId) &&
    isStableId(value.subject.profileId) &&
    typeof value.subject.handle === 'string' &&
    HANDLE_PATTERN.test(value.subject.handle) &&
    Number.isSafeInteger(value.subject.proposedProjectionVersion) &&
    Number(value.subject.proposedProjectionVersion) > 0 &&
    isStableId(value.integrity.keyId) &&
    typeof value.integrity.digest === 'string' &&
    SHA256_PATTERN.test(value.integrity.digest) &&
    CHECK_NAMES.every((check) => checks[check] === 'passed')
  );
}

function validateRejectedReceipt(value: Record<string, unknown>): boolean {
  if (
    !hasExactKeys(value, ['schemaVersion', 'status', 'code', 'issues', 'truncated']) ||
    typeof value.code !== 'string' ||
    !REJECTION_CODES.has(value.code as PublicationVerificationRejectionCode) ||
    !Array.isArray(value.issues) ||
    value.issues.length === 0 ||
    value.issues.length > PUBLICATION_VERIFICATION_MAX_ISSUES ||
    typeof value.truncated !== 'boolean'
  ) {
    return false;
  }
  return value.issues.every(
    (issue) =>
      isRecord(issue) &&
      hasExactKeys(issue, ['path', 'message']) &&
      typeof issue.path === 'string' &&
      typeof issue.message === 'string' &&
      issue.message.length > 0 &&
      issue.message.length <= 500
  );
}

export function isPublicationVerificationReceiptV1(
  value: unknown
): value is PublicationVerificationReceiptV1 {
  if (
    !isRecord(value) ||
    value.schemaVersion !== PUBLICATION_VERIFICATION_SCHEMA_VERSION ||
    (value.status !== 'verified' && value.status !== 'rejected')
  ) {
    return false;
  }
  return value.status === 'verified'
    ? validateVerifiedReceipt(value)
    : validateRejectedReceipt(value);
}

export function isPublicationVerificationApiEnvelopeV1(
  value: unknown
): value is PublicationVerificationApiEnvelopeV1 {
  return (
    isRecord(value) &&
    hasExactKeys(value, ['ok', 'verification']) &&
    value.ok === true &&
    isPublicationVerificationReceiptV1(value.verification)
  );
}

const PASSED_CHECKS: PublicationVerificationChecks = {
  schema: 'passed',
  privacy: 'passed',
  identity: 'passed',
  referenceMetadata: 'passed',
  digest: 'passed',
  signature: 'passed',
};

export function createVerifiedPublicationReceipt(
  bundle: PublicationBundleV1,
  digest: string
): VerifiedPublicationReceiptV1 {
  return {
    schemaVersion: PUBLICATION_VERIFICATION_SCHEMA_VERSION,
    status: 'verified',
    subject: {
      bundleId: bundle.bundleId,
      workspaceId: bundle.workspaceId,
      profileId: bundle.target.profileId,
      handle: bundle.target.handle,
      proposedProjectionVersion: bundle.target.proposedProjectionVersion,
    },
    integrity: {
      keyId: bundle.integrity.keyId,
      digest,
    },
    checks: { ...PASSED_CHECKS },
  };
}

export function createRejectedPublicationReceipt(
  code: PublicationVerificationRejectionCode,
  issues: readonly PublicationBundleIssue[]
): RejectedPublicationReceiptV1 {
  const boundedIssues = issues.slice(0, PUBLICATION_VERIFICATION_MAX_ISSUES).map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));
  return {
    schemaVersion: PUBLICATION_VERIFICATION_SCHEMA_VERSION,
    status: 'rejected',
    code,
    issues: boundedIssues.length
      ? boundedIssues
      : [{ path: '', message: 'Publication verification failed.' }],
    truncated: issues.length > PUBLICATION_VERIFICATION_MAX_ISSUES,
  };
}
