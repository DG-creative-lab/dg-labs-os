import { generateKeyPairSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  canonicalizePublicationSigningDocument,
  createPublicationIntegrityMetadata,
  createPublicationSigningDocument,
  validatePublicationBundle,
  type PublicationBundlePayloadV1,
} from '../../src/publication';
import { signPublicationBundle, verifyPublicationBundle } from '../../src/publication/crypto';
import {
  publicationBundlePayloadV1Fixture as fixture,
  publicationBundleV1Fixture,
  publicationBundleV1FixturePublicKey,
} from '../fixtures/contracts/publicationBundleV1';

const signingKeys = generateKeyPairSync('ed25519');
const otherKeys = generateKeyPairSync('ed25519');

describe('signed publication bundle flow', () => {
  it('verifies the committed v1 fixture with its synthetic public key', () => {
    expect(
      verifyPublicationBundle(publicationBundleV1Fixture, {
        keyId: 'key_contract_fixture',
        publicKey: publicationBundleV1FixturePublicKey,
      })
    ).toEqual({
      valid: true,
      bundleId: fixture.bundleId,
      keyId: 'key_contract_fixture',
      digest: publicationBundleV1Fixture.integrity.digest,
    });
  });

  it('canonicalizes equivalent payloads identically regardless of property insertion order', () => {
    const reordered: PublicationBundlePayloadV1 = {
      approval: fixture.approval,
      assets: fixture.assets,
      records: fixture.records,
      preparedBy: fixture.preparedBy,
      createdAt: fixture.createdAt,
      target: {
        proposedProjectionVersion: fixture.target.proposedProjectionVersion,
        baseProjectionVersion: fixture.target.baseProjectionVersion,
        handle: fixture.target.handle,
        profileId: fixture.target.profileId,
      },
      workspaceId: fixture.workspaceId,
      bundleId: fixture.bundleId,
      schemaVersion: fixture.schemaVersion,
    };
    const metadata = createPublicationIntegrityMetadata('key_contract_fixture');

    expect(
      canonicalizePublicationSigningDocument(createPublicationSigningDocument(reordered, metadata))
    ).toBe(
      canonicalizePublicationSigningDocument(createPublicationSigningDocument(fixture, metadata))
    );
  });

  it('signs and verifies a valid bundle deterministically', () => {
    const first = signPublicationBundle(fixture, {
      keyId: 'key_contract_fixture',
      privateKey: signingKeys.privateKey,
    });
    const second = signPublicationBundle(fixture, {
      keyId: 'key_contract_fixture',
      privateKey: signingKeys.privateKey,
    });

    expect(validatePublicationBundle(first)).toEqual([]);
    expect(first.integrity.digest).toBe(second.integrity.digest);
    expect(first.integrity.signature).toBe(second.integrity.signature);
    expect(
      verifyPublicationBundle(first, {
        keyId: 'key_contract_fixture',
        publicKey: signingKeys.publicKey,
      })
    ).toEqual({
      valid: true,
      bundleId: fixture.bundleId,
      keyId: 'key_contract_fixture',
      digest: first.integrity.digest,
    });
  });

  it('rejects payload tampering, a mismatched key ID, and the wrong public key', () => {
    const signed = signPublicationBundle(fixture, {
      keyId: 'key_contract_fixture',
      privateKey: signingKeys.privateKey,
    });
    const tampered = { ...signed, workspaceId: 'workspace_other' };

    expect(
      verifyPublicationBundle(tampered, {
        keyId: 'key_contract_fixture',
        publicKey: signingKeys.publicKey,
      })
    ).toEqual({
      valid: false,
      issues: [
        {
          path: 'integrity.digest',
          message: 'Bundle digest does not match the signed document.',
        },
      ],
    });
    expect(
      verifyPublicationBundle(signed, {
        keyId: 'key_other',
        publicKey: signingKeys.publicKey,
      })
    ).toEqual({
      valid: false,
      issues: [
        {
          path: 'integrity.keyId',
          message: 'Verification key does not match the signed key ID.',
        },
      ],
    });
    expect(
      verifyPublicationBundle(signed, {
        keyId: 'key_contract_fixture',
        publicKey: otherKeys.publicKey,
      })
    ).toEqual({
      valid: false,
      issues: [{ path: 'integrity.signature', message: 'Bundle signature is invalid.' }],
    });
  });

  it('rejects unsupported integrity algorithms before cryptographic verification', () => {
    const signed = signPublicationBundle(fixture, {
      keyId: 'key_contract_fixture',
      privateKey: signingKeys.privateKey,
    });
    const unsupported = {
      ...signed,
      integrity: { ...signed.integrity, signatureAlgorithm: 'rsa-pss' },
    };

    expect(
      verifyPublicationBundle(unsupported, {
        keyId: 'key_contract_fixture',
        publicKey: signingKeys.publicKey,
      })
    ).toEqual({
      valid: false,
      issues: [
        {
          path: 'integrity.signatureAlgorithm',
          message: 'Unsupported signature algorithm.',
        },
      ],
    });
  });
});
