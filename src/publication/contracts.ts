import type { ProfileProjectionSchemaVersion } from '../profiles/contracts';
import type { ProfileModulesSchemaVersion } from '../profiles/modules/contracts';
import type { PublicNetworkSchemaVersion } from '../profiles/network/contracts';
import type { PublicResumeSchemaVersion } from '../profiles/resume/contracts';
import type { PublicWritingSchemaVersion } from '../profiles/writing/contracts';

export const PUBLICATION_BUNDLE_SCHEMA_VERSION = 'dg-os.publication-bundle/v1' as const;
export const PUBLICATION_CANONICALIZATION = 'rfc8785' as const;
export const PUBLICATION_DIGEST_ALGORITHM = 'sha256' as const;
export const PUBLICATION_SIGNATURE_ALGORITHM = 'ed25519' as const;

export type PublicationBundleSchemaVersion = typeof PUBLICATION_BUNDLE_SCHEMA_VERSION;
export type PublicationCanonicalization = typeof PUBLICATION_CANONICALIZATION;
export type PublicationDigestAlgorithm = typeof PUBLICATION_DIGEST_ALGORITHM;
export type PublicationSignatureAlgorithm = typeof PUBLICATION_SIGNATURE_ALGORITHM;

type PublicationRecordReferenceBase = {
  recordId: string;
  profileId: string;
  handle: string;
  projectionVersion: number;
  recordVersion: number;
  sha256: string;
  byteLength: number;
};

export type PublicationRecordReference =
  | (PublicationRecordReferenceBase & {
      kind: 'profile';
      schemaVersion: ProfileProjectionSchemaVersion;
    })
  | (PublicationRecordReferenceBase & {
      kind: 'profile-modules';
      schemaVersion: ProfileModulesSchemaVersion;
    })
  | (PublicationRecordReferenceBase & {
      kind: 'network';
      schemaVersion: PublicNetworkSchemaVersion;
    })
  | (PublicationRecordReferenceBase & {
      kind: 'writing';
      schemaVersion: PublicWritingSchemaVersion;
    })
  | (PublicationRecordReferenceBase & {
      kind: 'resume';
      schemaVersion: PublicResumeSchemaVersion;
    });

export type PublicationAssetReference = {
  assetId: string;
  mediaType: string;
  sha256: string;
  byteLength: number;
};

export type PublicationPreparedBy =
  | {
      kind: 'human';
      actorId: string;
      provider: null;
      client: 'manual';
    }
  | {
      kind: 'agent';
      actorId: string;
      provider: 'openai';
      client: 'codex';
      installationId: string;
    }
  | {
      kind: 'agent';
      actorId: string;
      provider: 'anthropic';
      client: 'claude-code';
      installationId: string;
    }
  | {
      kind: 'agent';
      actorId: string;
      provider: 'local';
      client: 'manual';
      installationId: string;
    };

export type PublicationBundlePayloadV1 = {
  schemaVersion: PublicationBundleSchemaVersion;
  bundleId: string;
  workspaceId: string;
  target: {
    profileId: string;
    handle: string;
    baseProjectionVersion: number;
    proposedProjectionVersion: number;
  };
  createdAt: string;
  preparedBy: PublicationPreparedBy;
  records: readonly PublicationRecordReference[];
  assets: readonly PublicationAssetReference[];
  approval: {
    approvedByUserId: string;
    approvedAt: string;
    method: 'local-signature';
  };
};

export type PublicationIntegrityMetadata = {
  canonicalization: PublicationCanonicalization;
  digestAlgorithm: PublicationDigestAlgorithm;
  signatureAlgorithm: PublicationSignatureAlgorithm;
  keyId: string;
};

export type PublicationBundleIntegrity = PublicationIntegrityMetadata & {
  digest: string;
  signature: string;
};

/**
 * Signed, provider-neutral manifest for one proposed public profile version.
 *
 * The bundle pins content-addressed public record and asset references. Raw
 * private sources, credentials, signing keys, provider sessions and record
 * payloads do not belong in this envelope.
 */
export type PublicationBundleV1 = PublicationBundlePayloadV1 & {
  integrity: PublicationBundleIntegrity;
};

export type PublicationBundleSigningDocument = PublicationBundlePayloadV1 & {
  integrity: PublicationIntegrityMetadata;
};

export type PublicationBundleIssue = {
  path: string;
  message: string;
};
