import type { PublicationBundleIssue, PublicationBundleV1 } from './contracts';

export const PUBLICATION_VERIFICATION_SCHEMA_VERSION = 'dg-os.publication-verification/v1' as const;
export const PUBLICATION_VERIFICATION_MAX_ISSUES = 25;
export const PUBLICATION_VERIFICATION_MAX_PATH_LENGTH = 96;
export const PUBLICATION_VERIFICATION_MAX_MESSAGE_LENGTH = 128;

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
const PUBLIC_ROOT_PATHS = new Set([
  '',
  'schemaVersion',
  'bundleId',
  'workspaceId',
  'target',
  'createdAt',
  'preparedBy',
  'records',
  'assets',
  'approval',
  'integrity',
]);
const PUBLIC_OBJECT_FIELDS = {
  target: new Set(['profileId', 'handle', 'baseProjectionVersion', 'proposedProjectionVersion']),
  preparedBy: new Set(['kind', 'actorId', 'provider', 'client', 'installationId']),
  approval: new Set(['approvedByUserId', 'approvedAt', 'method']),
  integrity: new Set([
    'canonicalization',
    'digestAlgorithm',
    'signatureAlgorithm',
    'keyId',
    'digest',
    'signature',
  ]),
} as const;
const PUBLIC_ARRAY_FIELDS = {
  records: new Set([
    'kind',
    'schemaVersion',
    'recordId',
    'profileId',
    'handle',
    'projectionVersion',
    'recordVersion',
    'sha256',
    'byteLength',
  ]),
  assets: new Set(['assetId', 'mediaType', 'sha256', 'byteLength']),
} as const;
const PUBLIC_ARRAY_PATH_PATTERN = /^(records|assets)\[(0|[1-9]\d{0,5})\](?:\.([a-zA-Z]+))?$/;
const PUBLIC_ISSUE_FALLBACK_MESSAGE = 'Publication data is invalid.';
const PUBLIC_ISSUE_MESSAGES = new Set([
  PUBLIC_ISSUE_FALLBACK_MESSAGE,
  'Publication verification failed.',
  'Required field is missing.',
  'Unknown fields are forbidden in signed publication data.',
  'Publication bundle arrays must use the native array prototype.',
  'Publication bundle arrays may contain canonical numeric indices only.',
  'Publication bundle arrays cannot use accessors.',
  'Publication bundle arrays must be dense.',
  'Publication bundle objects may contain string properties only.',
  'Publication bundle objects cannot use accessors.',
  'Publication bundle object properties must be enumerable.',
  'Secret-bearing fields are forbidden.',
  'Internal source metadata is forbidden.',
  'Publication bundles must contain JSON values only.',
  'Publication bundles cannot contain non-finite numbers.',
  'Publication bundles cannot contain local filesystem paths.',
  'Publication bundles cannot contain circular references.',
  'Publication bundles must use plain JSON objects.',
  'Publication target must be an object.',
  'Profile ID must be a stable identifier.',
  'Handle must be a URL-safe lowercase slug.',
  'Base version must be a non-negative integer.',
  'Proposed version must be positive.',
  'Proposed projection version must immediately follow the base version.',
  'Preparer metadata must be an object.',
  'Actor ID must be a stable identifier.',
  'Human preparation must use the manual client without an AI provider.',
  'Human preparation cannot claim an agent installation.',
  'Unsupported preparer kind.',
  'Agent preparation requires a stable installation ID.',
  'Agent provider and client must use a supported pairing.',
  'A publication bundle requires record references.',
  'Record references must be objects.',
  'Unsupported public record kind.',
  'Record schema does not match its kind.',
  'Record kinds must be unique within a bundle.',
  'Record ID must be a stable identifier.',
  'Record IDs must be unique.',
  'Record profile must match the target.',
  'Record handle must match the target.',
  'Record projection version must match the proposed target version.',
  'Record version must be positive.',
  'Record digest must be lowercase SHA-256.',
  'Record byte length must be positive.',
  'A bundle must reference exactly one profile record.',
  'Asset references must be an array.',
  'A bundle cannot reference more than 100 assets.',
  'Asset references must be objects.',
  'Asset ID must be a stable identifier.',
  'Asset IDs must be unique.',
  'Asset media type is invalid.',
  'Asset digest must be lowercase SHA-256.',
  'Asset byte length must be positive.',
  'Publication approval must be an object.',
  'Approver ID must be stable.',
  'Approval time must be an ISO UTC timestamp.',
  'Unsupported publication approval method.',
  'Approval cannot precede bundle creation.',
  'Publication bundle payload must be an object.',
  'Unsupported publication bundle schema.',
  'Bundle ID must be a UUID v4.',
  'Workspace ID must be a stable identifier.',
  'Creation time must be an ISO UTC timestamp.',
  'Bundle integrity metadata must be an object.',
  'Unsupported canonicalization.',
  'Unsupported digest algorithm.',
  'Unsupported signature algorithm.',
  'Signing key ID must be a stable identifier.',
  'Bundle digest must be lowercase SHA-256.',
  'Ed25519 signature must be 64-byte base64.',
  'No trusted signing key matches the complete publication identity boundary.',
  'Verification key does not match the signed key ID.',
  'Bundle digest does not match the signed document.',
  'Bundle signature is invalid.',
  'Bundle signature could not be verified.',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
};

const isStableId = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 128 && ID_PATTERN.test(value);

function sanitizePublicIssuePath(path: string): string {
  if (PUBLIC_ROOT_PATHS.has(path)) return path;

  for (const [root, fields] of Object.entries(PUBLIC_OBJECT_FIELDS)) {
    if (path.startsWith(`${root}.`)) {
      const field = path.slice(root.length + 1);
      return fields.has(field) ? path : root;
    }
  }

  const arrayMatch = PUBLIC_ARRAY_PATH_PATTERN.exec(path);
  if (arrayMatch) {
    const [, root, index, field] = arrayMatch;
    const itemPath = `${root}[${index}]`;
    if (!field) return itemPath;
    return PUBLIC_ARRAY_FIELDS[root as keyof typeof PUBLIC_ARRAY_FIELDS].has(field)
      ? path
      : itemPath;
  }
  if (path.startsWith('records.') || path.startsWith('records[')) return 'records';
  if (path.startsWith('assets.') || path.startsWith('assets[')) return 'assets';
  return '';
}

function sanitizePublicIssueMessage(message: string): string {
  return PUBLIC_ISSUE_MESSAGES.has(message) &&
    message.length <= PUBLICATION_VERIFICATION_MAX_MESSAGE_LENGTH
    ? message
    : PUBLIC_ISSUE_FALLBACK_MESSAGE;
}

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
      issue.path.length <= PUBLICATION_VERIFICATION_MAX_PATH_LENGTH &&
      sanitizePublicIssuePath(issue.path) === issue.path &&
      issue.message.length > 0 &&
      issue.message.length <= PUBLICATION_VERIFICATION_MAX_MESSAGE_LENGTH &&
      PUBLIC_ISSUE_MESSAGES.has(issue.message)
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
    path: sanitizePublicIssuePath(issue.path).slice(0, PUBLICATION_VERIFICATION_MAX_PATH_LENGTH),
    message: sanitizePublicIssueMessage(issue.message).slice(
      0,
      PUBLICATION_VERIFICATION_MAX_MESSAGE_LENGTH
    ),
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
