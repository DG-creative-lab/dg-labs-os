import { PROFILE_PROJECTION_SCHEMA_VERSION } from '../profiles/contracts';
import { PROFILE_MODULES_SCHEMA_VERSION } from '../profiles/modules/contracts';
import { PUBLIC_NETWORK_SCHEMA_VERSION } from '../profiles/network/contracts';
import { PUBLIC_RESUME_SCHEMA_VERSION } from '../profiles/resume/contracts';
import { PUBLIC_WRITING_SCHEMA_VERSION } from '../profiles/writing/contracts';
import {
  PUBLICATION_BUNDLE_SCHEMA_VERSION,
  PUBLICATION_CANONICALIZATION,
  PUBLICATION_DIGEST_ALGORITHM,
  PUBLICATION_SIGNATURE_ALGORITHM,
  type PublicationBundleIssue,
  type PublicationBundlePayloadV1,
  type PublicationBundleV1,
} from './contracts';

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const ARRAY_INDEX_PATTERN = /^(?:0|[1-9]\d*)$/;
const MEDIA_TYPE_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;
const PRIVATE_PATH_PATTERNS = [
  /file:\/\/[^\s"'<>]+/i,
  /(?:^|[\s([{"'=,:;])\/(?:Users|home|src|scripts)\//i,
  /(?:^|[\s([{"'=,:;])[A-Za-z]:\\/i,
] as const;
const SECRET_KEY_PATTERN =
  /(?:password|secret|private[_-]?key|access[_-]?token|refresh[_-]?token)/i;
const INTERNAL_SOURCE_KEY_PATTERN =
  /^(?:sourcePath|source_path|internalPath|internal_path|internalSource|internal_source)$/i;

const RECORD_SCHEMA_BY_KIND = {
  profile: PROFILE_PROJECTION_SCHEMA_VERSION,
  'profile-modules': PROFILE_MODULES_SCHEMA_VERSION,
  network: PUBLIC_NETWORK_SCHEMA_VERSION,
  writing: PUBLIC_WRITING_SCHEMA_VERSION,
  resume: PUBLIC_RESUME_SCHEMA_VERSION,
} as const;

const PAYLOAD_KEYS = [
  'schemaVersion',
  'bundleId',
  'workspaceId',
  'target',
  'createdAt',
  'preparedBy',
  'records',
  'assets',
  'approval',
] as const;
const BUNDLE_KEYS = [...PAYLOAD_KEYS, 'integrity'] as const;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  ) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return false;
  const normalized = value.includes('.') ? value : value.replace('Z', '.000Z');
  return parsed.toISOString() === normalized;
}

function validateObjectKeys(
  value: JsonRecord,
  path: string,
  required: readonly string[],
  allowed: readonly string[],
  issues: PublicationBundleIssue[]
): void {
  const keys = Object.keys(value);
  for (const key of required) {
    if (!Object.hasOwn(value, key)) {
      issues.push({ path: path ? `${path}.${key}` : key, message: 'Required field is missing.' });
    }
  }
  for (const key of keys) {
    if (!allowed.includes(key)) {
      issues.push({
        path: path ? `${path}.${key}` : key,
        message: 'Unknown fields are forbidden in signed publication data.',
      });
    }
  }
}

function arrayPropertyPath(path: string, key: PropertyKey): string {
  if (typeof key !== 'string') return `${path}[${String(key)}]`;
  return ARRAY_INDEX_PATTERN.test(key) ? `${path}[${key}]` : `${path}.${key}`;
}

function inspectArraySafety(
  value: unknown[],
  path: string,
  issues: PublicationBundleIssue[],
  ancestors: Set<object>
): void {
  if (Object.getPrototypeOf(value) !== Array.prototype) {
    issues.push({
      path,
      message: 'Publication bundle arrays must use the native array prototype.',
    });
  }

  let indexCount = 0;
  for (const key of Reflect.ownKeys(value)) {
    if (key === 'length') continue;

    const childPath = arrayPropertyPath(path, key);
    const isCanonicalIndex =
      typeof key === 'string' &&
      ARRAY_INDEX_PATTERN.test(key) &&
      Number(key) < value.length &&
      Number(key) < 4_294_967_295;
    if (!isCanonicalIndex) {
      issues.push({
        path: childPath,
        message: 'Publication bundle arrays may contain canonical numeric indices only.',
      });
    } else {
      indexCount += 1;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      issues.push({ path: childPath, message: 'Publication bundle arrays cannot use accessors.' });
      continue;
    }

    if (typeof key === 'string') {
      if (SECRET_KEY_PATTERN.test(key) && descriptor.value !== null && descriptor.value !== '') {
        issues.push({ path: childPath, message: 'Secret-bearing fields are forbidden.' });
      }
      if (
        INTERNAL_SOURCE_KEY_PATTERN.test(key) &&
        descriptor.value !== null &&
        descriptor.value !== ''
      ) {
        issues.push({ path: childPath, message: 'Internal source metadata is forbidden.' });
      }
    }
    inspectJsonSafety(descriptor.value, childPath, issues, ancestors);
  }

  if (indexCount !== value.length) {
    issues.push({ path, message: 'Publication bundle arrays must be dense.' });
  }
}

function inspectObjectSafety(
  value: JsonRecord,
  path: string,
  issues: PublicationBundleIssue[],
  ancestors: Set<object>
): void {
  for (const key of Reflect.ownKeys(value)) {
    const childPath =
      typeof key === 'symbol' ? `${path}[${String(key)}]` : path ? `${path}.${key}` : key;
    if (typeof key !== 'string') {
      issues.push({
        path: childPath,
        message: 'Publication bundle objects may contain string properties only.',
      });
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      issues.push({ path: childPath, message: 'Publication bundle objects cannot use accessors.' });
      continue;
    }
    if (!descriptor.enumerable) {
      issues.push({
        path: childPath,
        message: 'Publication bundle object properties must be enumerable.',
      });
    }

    if (typeof key === 'string') {
      if (SECRET_KEY_PATTERN.test(key) && descriptor.value !== null && descriptor.value !== '') {
        issues.push({ path: childPath, message: 'Secret-bearing fields are forbidden.' });
      }
      if (
        INTERNAL_SOURCE_KEY_PATTERN.test(key) &&
        descriptor.value !== null &&
        descriptor.value !== ''
      ) {
        issues.push({ path: childPath, message: 'Internal source metadata is forbidden.' });
      }
    }
    inspectJsonSafety(descriptor.value, childPath, issues, ancestors);
  }
}

function inspectJsonSafety(
  value: unknown,
  path: string,
  issues: PublicationBundleIssue[],
  ancestors = new Set<object>()
): void {
  if (
    value === undefined ||
    typeof value === 'function' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint'
  ) {
    issues.push({ path, message: 'Publication bundles must contain JSON values only.' });
    return;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    issues.push({ path, message: 'Publication bundles cannot contain non-finite numbers.' });
    return;
  }
  if (typeof value === 'string') {
    if (PRIVATE_PATH_PATTERNS.some((pattern) => pattern.test(value))) {
      issues.push({ path, message: 'Publication bundles cannot contain local filesystem paths.' });
    }
    return;
  }
  if (value === null || typeof value !== 'object') return;
  if (ancestors.has(value)) {
    issues.push({ path, message: 'Publication bundles cannot contain circular references.' });
    return;
  }

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    issues.push({ path, message: 'Publication bundles must use plain JSON objects.' });
    return;
  }

  ancestors.add(value);
  if (Array.isArray(value)) {
    inspectArraySafety(value, path, issues, ancestors);
  } else {
    inspectObjectSafety(value as JsonRecord, path, issues, ancestors);
  }
  ancestors.delete(value);
}

function validateTarget(value: unknown, issues: PublicationBundleIssue[]): void {
  if (!isRecord(value)) {
    issues.push({ path: 'target', message: 'Publication target must be an object.' });
    return;
  }
  const keys = [
    'profileId',
    'handle',
    'baseProjectionVersion',
    'proposedProjectionVersion',
  ] as const;
  validateObjectKeys(value, 'target', keys, keys, issues);
  if (!isNonEmptyString(value.profileId) || !ID_PATTERN.test(value.profileId)) {
    issues.push({ path: 'target.profileId', message: 'Profile ID must be a stable identifier.' });
  }
  if (!isNonEmptyString(value.handle) || !HANDLE_PATTERN.test(value.handle)) {
    issues.push({ path: 'target.handle', message: 'Handle must be a URL-safe lowercase slug.' });
  }
  if (!isNonNegativeInteger(value.baseProjectionVersion)) {
    issues.push({
      path: 'target.baseProjectionVersion',
      message: 'Base version must be a non-negative integer.',
    });
  }
  if (!isPositiveInteger(value.proposedProjectionVersion)) {
    issues.push({
      path: 'target.proposedProjectionVersion',
      message: 'Proposed version must be positive.',
    });
  }
  if (
    isNonNegativeInteger(value.baseProjectionVersion) &&
    isPositiveInteger(value.proposedProjectionVersion) &&
    value.proposedProjectionVersion !== value.baseProjectionVersion + 1
  ) {
    issues.push({
      path: 'target.proposedProjectionVersion',
      message: 'Proposed projection version must immediately follow the base version.',
    });
  }
}

function validatePreparedBy(value: unknown, issues: PublicationBundleIssue[]): void {
  if (!isRecord(value)) {
    issues.push({ path: 'preparedBy', message: 'Preparer metadata must be an object.' });
    return;
  }
  const baseKeys = ['kind', 'actorId', 'provider', 'client'] as const;
  const allowedKeys = [...baseKeys, 'installationId'] as const;
  validateObjectKeys(value, 'preparedBy', baseKeys, allowedKeys, issues);
  if (!isNonEmptyString(value.actorId) || !ID_PATTERN.test(value.actorId)) {
    issues.push({ path: 'preparedBy.actorId', message: 'Actor ID must be a stable identifier.' });
  }

  if (value.kind === 'human') {
    if (value.provider !== null || value.client !== 'manual') {
      issues.push({
        path: 'preparedBy',
        message: 'Human preparation must use the manual client without an AI provider.',
      });
    }
    if (Object.hasOwn(value, 'installationId')) {
      issues.push({
        path: 'preparedBy.installationId',
        message: 'Human preparation cannot claim an agent installation.',
      });
    }
    return;
  }

  if (value.kind !== 'agent') {
    issues.push({ path: 'preparedBy.kind', message: 'Unsupported preparer kind.' });
    return;
  }
  if (!isNonEmptyString(value.installationId) || !ID_PATTERN.test(value.installationId)) {
    issues.push({
      path: 'preparedBy.installationId',
      message: 'Agent preparation requires a stable installation ID.',
    });
  }
  const supportedPair =
    (value.provider === 'openai' && value.client === 'codex') ||
    (value.provider === 'anthropic' && value.client === 'claude-code') ||
    (value.provider === 'local' && value.client === 'manual');
  if (!supportedPair) {
    issues.push({
      path: 'preparedBy',
      message: 'Agent provider and client must use a supported pairing.',
    });
  }
}

function validateRecords(value: unknown, target: unknown, issues: PublicationBundleIssue[]): void {
  if (!Array.isArray(value) || !value.length) {
    issues.push({ path: 'records', message: 'A publication bundle requires record references.' });
    return;
  }
  const targetRecord = isRecord(target) ? target : undefined;
  const recordIds = new Set<string>();
  const kinds = new Set<string>();
  value.forEach((record, index) => {
    const path = `records[${index}]`;
    if (!isRecord(record)) {
      issues.push({ path, message: 'Record references must be objects.' });
      return;
    }
    const keys = [
      'kind',
      'schemaVersion',
      'recordId',
      'profileId',
      'handle',
      'projectionVersion',
      'recordVersion',
      'sha256',
      'byteLength',
    ] as const;
    validateObjectKeys(record, path, keys, keys, issues);
    if (typeof record.kind !== 'string' || !(record.kind in RECORD_SCHEMA_BY_KIND)) {
      issues.push({ path: `${path}.kind`, message: 'Unsupported public record kind.' });
    } else {
      const expectedSchema =
        RECORD_SCHEMA_BY_KIND[record.kind as keyof typeof RECORD_SCHEMA_BY_KIND];
      if (record.schemaVersion !== expectedSchema) {
        issues.push({
          path: `${path}.schemaVersion`,
          message: 'Record schema does not match its kind.',
        });
      }
      if (kinds.has(record.kind)) {
        issues.push({
          path: `${path}.kind`,
          message: 'Record kinds must be unique within a bundle.',
        });
      }
      kinds.add(record.kind);
    }
    if (!isNonEmptyString(record.recordId) || !ID_PATTERN.test(record.recordId)) {
      issues.push({ path: `${path}.recordId`, message: 'Record ID must be a stable identifier.' });
    } else if (recordIds.has(record.recordId)) {
      issues.push({ path: `${path}.recordId`, message: 'Record IDs must be unique.' });
    } else {
      recordIds.add(record.recordId);
    }
    if (record.profileId !== targetRecord?.profileId) {
      issues.push({ path: `${path}.profileId`, message: 'Record profile must match the target.' });
    }
    if (record.handle !== targetRecord?.handle) {
      issues.push({ path: `${path}.handle`, message: 'Record handle must match the target.' });
    }
    if (record.projectionVersion !== targetRecord?.proposedProjectionVersion) {
      issues.push({
        path: `${path}.projectionVersion`,
        message: 'Record projection version must match the proposed target version.',
      });
    }
    if (!isPositiveInteger(record.recordVersion)) {
      issues.push({ path: `${path}.recordVersion`, message: 'Record version must be positive.' });
    }
    if (typeof record.sha256 !== 'string' || !SHA256_PATTERN.test(record.sha256)) {
      issues.push({ path: `${path}.sha256`, message: 'Record digest must be lowercase SHA-256.' });
    }
    if (!isPositiveInteger(record.byteLength)) {
      issues.push({ path: `${path}.byteLength`, message: 'Record byte length must be positive.' });
    }
  });
  if (!kinds.has('profile')) {
    issues.push({
      path: 'records',
      message: 'A bundle must reference exactly one profile record.',
    });
  }
}

function validateAssets(value: unknown, issues: PublicationBundleIssue[]): void {
  if (!Array.isArray(value)) {
    issues.push({ path: 'assets', message: 'Asset references must be an array.' });
    return;
  }
  if (value.length > 100) {
    issues.push({ path: 'assets', message: 'A bundle cannot reference more than 100 assets.' });
  }
  const assetIds = new Set<string>();
  value.forEach((asset, index) => {
    const path = `assets[${index}]`;
    if (!isRecord(asset)) {
      issues.push({ path, message: 'Asset references must be objects.' });
      return;
    }
    const keys = ['assetId', 'mediaType', 'sha256', 'byteLength'] as const;
    validateObjectKeys(asset, path, keys, keys, issues);
    if (!isNonEmptyString(asset.assetId) || !ID_PATTERN.test(asset.assetId)) {
      issues.push({ path: `${path}.assetId`, message: 'Asset ID must be a stable identifier.' });
    } else if (assetIds.has(asset.assetId)) {
      issues.push({ path: `${path}.assetId`, message: 'Asset IDs must be unique.' });
    } else {
      assetIds.add(asset.assetId);
    }
    if (typeof asset.mediaType !== 'string' || !MEDIA_TYPE_PATTERN.test(asset.mediaType)) {
      issues.push({ path: `${path}.mediaType`, message: 'Asset media type is invalid.' });
    }
    if (typeof asset.sha256 !== 'string' || !SHA256_PATTERN.test(asset.sha256)) {
      issues.push({ path: `${path}.sha256`, message: 'Asset digest must be lowercase SHA-256.' });
    }
    if (!isPositiveInteger(asset.byteLength)) {
      issues.push({ path: `${path}.byteLength`, message: 'Asset byte length must be positive.' });
    }
  });
}

function validateApproval(
  value: unknown,
  createdAt: unknown,
  issues: PublicationBundleIssue[]
): void {
  if (!isRecord(value)) {
    issues.push({ path: 'approval', message: 'Publication approval must be an object.' });
    return;
  }
  const keys = ['approvedByUserId', 'approvedAt', 'method'] as const;
  validateObjectKeys(value, 'approval', keys, keys, issues);
  if (!isNonEmptyString(value.approvedByUserId) || !ID_PATTERN.test(value.approvedByUserId)) {
    issues.push({ path: 'approval.approvedByUserId', message: 'Approver ID must be stable.' });
  }
  if (!isIsoTimestamp(value.approvedAt)) {
    issues.push({
      path: 'approval.approvedAt',
      message: 'Approval time must be an ISO UTC timestamp.',
    });
  }
  if (value.method !== 'local-signature') {
    issues.push({ path: 'approval.method', message: 'Unsupported publication approval method.' });
  }
  if (
    isIsoTimestamp(createdAt) &&
    isIsoTimestamp(value.approvedAt) &&
    Date.parse(value.approvedAt) < Date.parse(createdAt)
  ) {
    issues.push({
      path: 'approval.approvedAt',
      message: 'Approval cannot precede bundle creation.',
    });
  }
}

function validatePayloadShape(
  value: unknown,
  allowedKeys: readonly string[],
  issues: PublicationBundleIssue[]
): boolean {
  if (!isRecord(value)) {
    issues.push({ path: '', message: 'Publication bundle payload must be an object.' });
    return false;
  }
  validateObjectKeys(value, '', PAYLOAD_KEYS, allowedKeys, issues);
  if (value.schemaVersion !== PUBLICATION_BUNDLE_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: 'Unsupported publication bundle schema.' });
  }
  if (typeof value.bundleId !== 'string' || !UUID_V4_PATTERN.test(value.bundleId)) {
    issues.push({ path: 'bundleId', message: 'Bundle ID must be a UUID v4.' });
  }
  if (!isNonEmptyString(value.workspaceId) || !ID_PATTERN.test(value.workspaceId)) {
    issues.push({ path: 'workspaceId', message: 'Workspace ID must be a stable identifier.' });
  }
  validateTarget(value.target, issues);
  if (!isIsoTimestamp(value.createdAt)) {
    issues.push({ path: 'createdAt', message: 'Creation time must be an ISO UTC timestamp.' });
  }
  validatePreparedBy(value.preparedBy, issues);
  validateRecords(value.records, value.target, issues);
  validateAssets(value.assets, issues);
  validateApproval(value.approval, value.createdAt, issues);
  return true;
}

function validateIntegrity(value: unknown, issues: PublicationBundleIssue[]): void {
  if (!isRecord(value)) {
    issues.push({ path: 'integrity', message: 'Bundle integrity metadata must be an object.' });
    return;
  }
  const keys = [
    'canonicalization',
    'digestAlgorithm',
    'signatureAlgorithm',
    'keyId',
    'digest',
    'signature',
  ] as const;
  validateObjectKeys(value, 'integrity', keys, keys, issues);
  if (value.canonicalization !== PUBLICATION_CANONICALIZATION) {
    issues.push({ path: 'integrity.canonicalization', message: 'Unsupported canonicalization.' });
  }
  if (value.digestAlgorithm !== PUBLICATION_DIGEST_ALGORITHM) {
    issues.push({ path: 'integrity.digestAlgorithm', message: 'Unsupported digest algorithm.' });
  }
  if (value.signatureAlgorithm !== PUBLICATION_SIGNATURE_ALGORITHM) {
    issues.push({
      path: 'integrity.signatureAlgorithm',
      message: 'Unsupported signature algorithm.',
    });
  }
  if (!isNonEmptyString(value.keyId) || !ID_PATTERN.test(value.keyId)) {
    issues.push({
      path: 'integrity.keyId',
      message: 'Signing key ID must be a stable identifier.',
    });
  }
  if (typeof value.digest !== 'string' || !SHA256_PATTERN.test(value.digest)) {
    issues.push({ path: 'integrity.digest', message: 'Bundle digest must be lowercase SHA-256.' });
  }
  if (
    typeof value.signature !== 'string' ||
    !BASE64_PATTERN.test(value.signature) ||
    value.signature.length !== 88 ||
    !value.signature.endsWith('==') ||
    Buffer.from(value.signature, 'base64').toString('base64') !== value.signature
  ) {
    issues.push({
      path: 'integrity.signature',
      message: 'Ed25519 signature must be 64-byte base64.',
    });
  }
}

export function validatePublicationBundlePayload(value: unknown): PublicationBundleIssue[] {
  const issues: PublicationBundleIssue[] = [];
  inspectJsonSafety(value, '', issues);
  validatePayloadShape(value, PAYLOAD_KEYS, issues);
  return issues;
}

export function validatePublicationBundle(value: unknown): PublicationBundleIssue[] {
  const issues: PublicationBundleIssue[] = [];
  inspectJsonSafety(value, '', issues);
  if (!validatePayloadShape(value, BUNDLE_KEYS, issues) || !isRecord(value)) return issues;
  validateIntegrity(value.integrity, issues);
  return issues;
}

export function definePublicationBundlePayload<const T extends PublicationBundlePayloadV1>(
  payload: T
): T {
  const issues = validatePublicationBundlePayload(payload);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid publication bundle payload:\n${summary}`);
  }
  return payload;
}

export function definePublicationBundle<const T extends PublicationBundleV1>(bundle: T): T {
  const issues = validatePublicationBundle(bundle);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Invalid publication bundle:\n${summary}`);
  }
  return bundle;
}
