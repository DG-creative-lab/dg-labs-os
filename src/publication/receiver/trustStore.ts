import { createPublicKey, type KeyObject } from 'node:crypto';
import type { PublicationVerificationKey } from '../crypto';

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const PUBLIC_KEY_HEADER = '-----BEGIN PUBLIC KEY-----';
const PUBLIC_KEY_FOOTER = '-----END PUBLIC KEY-----';
const TRUST_CONFIG_KEYS = [
  'workspaceId',
  'profileId',
  'handle',
  'approvedByUserId',
  'keyId',
  'publicKeyPem',
] as const;

export const PUBLICATION_TRUST_CONFIG_MAX_BYTES = 65_536;
export const PUBLICATION_TRUST_CONFIG_MAX_KEYS = 32;

export type PublicationTrustIdentity = {
  workspaceId: string;
  profileId: string;
  handle: string;
  approvedByUserId: string;
  keyId: string;
};

export type PublicationTrustedKeyConfig = PublicationTrustIdentity & {
  publicKeyPem: string;
};

export type PublicationVerificationTrustStore = {
  resolve: (identity: PublicationTrustIdentity) => PublicationVerificationKey | undefined;
};

type TrustedKeyRecord = PublicationTrustIdentity & {
  publicKey: KeyObject;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const trustBindingId = (identity: PublicationTrustIdentity): string =>
  [
    identity.workspaceId,
    identity.profileId,
    identity.handle,
    identity.approvedByUserId,
    identity.keyId,
  ].join('\u0000');

function requireStableId(value: unknown, field: string, index: number): string {
  if (typeof value !== 'string' || !ID_PATTERN.test(value) || value.length > 128) {
    throw new Error(`Publication trust key ${index} has an invalid ${field}.`);
  }
  return value;
}

function parseTrustedKey(candidate: unknown, index: number): TrustedKeyRecord {
  if (!isRecord(candidate)) {
    throw new Error(`Publication trust key ${index} must be an object.`);
  }
  const keys = Object.keys(candidate);
  if (
    keys.length !== TRUST_CONFIG_KEYS.length ||
    keys.some((key) => !TRUST_CONFIG_KEYS.includes(key as (typeof TRUST_CONFIG_KEYS)[number]))
  ) {
    throw new Error(`Publication trust key ${index} has an invalid shape.`);
  }

  const workspaceId = requireStableId(candidate.workspaceId, 'workspaceId', index);
  const profileId = requireStableId(candidate.profileId, 'profileId', index);
  const approvedByUserId = requireStableId(candidate.approvedByUserId, 'approvedByUserId', index);
  const keyId = requireStableId(candidate.keyId, 'keyId', index);
  if (
    typeof candidate.handle !== 'string' ||
    !HANDLE_PATTERN.test(candidate.handle) ||
    candidate.handle.length > 63
  ) {
    throw new Error(`Publication trust key ${index} has an invalid handle.`);
  }
  if (
    typeof candidate.publicKeyPem !== 'string' ||
    candidate.publicKeyPem.length > 2_048 ||
    !candidate.publicKeyPem.includes(PUBLIC_KEY_HEADER) ||
    !candidate.publicKeyPem.includes(PUBLIC_KEY_FOOTER) ||
    candidate.publicKeyPem.includes('PRIVATE KEY')
  ) {
    throw new Error(`Publication trust key ${index} must contain a public key only.`);
  }

  let publicKey: KeyObject;
  try {
    publicKey = createPublicKey(candidate.publicKeyPem);
  } catch {
    throw new Error(`Publication trust key ${index} is not a valid public key.`);
  }
  if (publicKey.type !== 'public' || publicKey.asymmetricKeyType !== 'ed25519') {
    throw new Error(`Publication trust key ${index} must be an Ed25519 public key.`);
  }

  return {
    workspaceId,
    profileId,
    handle: candidate.handle,
    approvedByUserId,
    keyId,
    publicKey,
  };
}

export function createPublicationVerificationTrustStore(
  candidates: readonly unknown[]
): PublicationVerificationTrustStore {
  if (!candidates.length || candidates.length > PUBLICATION_TRUST_CONFIG_MAX_KEYS) {
    throw new Error('Publication trust configuration must contain between 1 and 32 keys.');
  }

  const records = new Map<string, TrustedKeyRecord>();
  candidates.forEach((candidate, index) => {
    const record = parseTrustedKey(candidate, index);
    const bindingId = trustBindingId(record);
    if (records.has(bindingId)) {
      throw new Error(`Publication trust key ${index} duplicates an existing identity binding.`);
    }
    records.set(bindingId, record);
  });

  return {
    resolve: (identity) => {
      const record = records.get(trustBindingId(identity));
      return record ? { keyId: record.keyId, publicKey: record.publicKey } : undefined;
    },
  };
}

export function createPublicationVerificationTrustStoreFromJson(
  rawConfig: string | undefined
): PublicationVerificationTrustStore {
  if (!rawConfig || Buffer.byteLength(rawConfig, 'utf8') > PUBLICATION_TRUST_CONFIG_MAX_BYTES) {
    throw new Error('Publication trust configuration is missing or too large.');
  }

  let candidate: unknown;
  try {
    candidate = JSON.parse(rawConfig);
  } catch {
    throw new Error('Publication trust configuration is not valid JSON.');
  }
  if (!Array.isArray(candidate)) {
    throw new Error('Publication trust configuration must be an array.');
  }
  return createPublicationVerificationTrustStore(candidate);
}
