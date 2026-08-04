import {
  createHash,
  sign as signBytes,
  timingSafeEqual,
  verify as verifyBytes,
  type KeyLike,
} from 'node:crypto';
import {
  canonicalizePublicationSigningDocument,
  createPublicationIntegrityMetadata,
  createPublicationSigningDocument,
} from './canonical';
import type {
  PublicationBundleIssue,
  PublicationBundlePayloadV1,
  PublicationBundleV1,
} from './contracts';
import { validatePublicationBundle, validatePublicationBundlePayload } from './validation';

export type PublicationSigningKey = {
  keyId: string;
  privateKey: KeyLike;
};

export type PublicationVerificationKey = {
  keyId: string;
  publicKey: KeyLike;
};

export type PublicationBundleVerificationResult =
  | {
      valid: true;
      bundleId: string;
      keyId: string;
      digest: string;
    }
  | {
      valid: false;
      issues: readonly PublicationBundleIssue[];
    };

function invalidResult(
  path: string,
  message: string
): Extract<PublicationBundleVerificationResult, { valid: false }> {
  return { valid: false, issues: [{ path, message }] };
}

function throwInvalidPayload(issues: readonly PublicationBundleIssue[]): never {
  const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
  throw new Error(`Invalid publication bundle payload:\n${summary}`);
}

function createCanonicalDocument(payload: PublicationBundlePayloadV1, keyId: string): string {
  const metadata = createPublicationIntegrityMetadata(keyId);
  return canonicalizePublicationSigningDocument(
    createPublicationSigningDocument(payload, metadata)
  );
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function hexToBytes(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(value.match(/.{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? []);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(Buffer.from(value, 'base64'));
}

function equalHex(left: string, right: string): boolean {
  const leftBytes = hexToBytes(left);
  const rightBytes = hexToBytes(right);
  return leftBytes.byteLength === rightBytes.byteLength && timingSafeEqual(leftBytes, rightBytes);
}

export function signPublicationBundle(
  payload: PublicationBundlePayloadV1,
  signingKey: PublicationSigningKey
): PublicationBundleV1 {
  const payloadIssues = validatePublicationBundlePayload(payload);
  if (payloadIssues.length) throwInvalidPayload(payloadIssues);

  const canonical = createCanonicalDocument(payload, signingKey.keyId);
  const integrity = {
    ...createPublicationIntegrityMetadata(signingKey.keyId),
    digest: sha256(canonical),
    signature: signBytes(null, new TextEncoder().encode(canonical), signingKey.privateKey).toString(
      'base64'
    ),
  } as const;
  const bundle: PublicationBundleV1 = { ...payload, integrity };
  const bundleIssues = validatePublicationBundle(bundle);
  if (bundleIssues.length) throwInvalidPayload(bundleIssues);
  return bundle;
}

export function verifyPublicationBundle(
  candidate: unknown,
  verificationKey: PublicationVerificationKey
): PublicationBundleVerificationResult {
  const issues = validatePublicationBundle(candidate);
  if (issues.length) return { valid: false, issues };

  const bundle = candidate as PublicationBundleV1;
  if (bundle.integrity.keyId !== verificationKey.keyId) {
    return invalidResult('integrity.keyId', 'Verification key does not match the signed key ID.');
  }

  const { integrity, ...payload } = bundle;
  const canonical = createCanonicalDocument(payload, integrity.keyId);
  const digest = sha256(canonical);
  if (!equalHex(digest, integrity.digest)) {
    return invalidResult('integrity.digest', 'Bundle digest does not match the signed document.');
  }

  try {
    const signatureValid = verifyBytes(
      null,
      new TextEncoder().encode(canonical),
      verificationKey.publicKey,
      base64ToBytes(integrity.signature)
    );
    if (!signatureValid) {
      return invalidResult('integrity.signature', 'Bundle signature is invalid.');
    }
  } catch {
    return invalidResult('integrity.signature', 'Bundle signature could not be verified.');
  }

  return {
    valid: true,
    bundleId: bundle.bundleId,
    keyId: integrity.keyId,
    digest,
  };
}
