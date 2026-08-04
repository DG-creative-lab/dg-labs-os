import { describe, expect, it } from 'vitest';
import {
  definePublicationBundlePayload,
  PUBLICATION_BUNDLE_SCHEMA_VERSION,
  validatePublicationBundle,
  validatePublicationBundlePayload,
  type PublicationBundlePayloadV1,
} from '../../src/publication';
import {
  publicationBundlePayloadV1Fixture as fixture,
  publicationBundleV1Fixture as signedFixture,
} from '../fixtures/contracts/publicationBundleV1';

describe('Publication Bundle v1 contract', () => {
  it('keeps the committed payload fixture valid, serialisable, and schema pinned', () => {
    expect(PUBLICATION_BUNDLE_SCHEMA_VERSION).toBe('dg-os.publication-bundle/v1');
    expect(validatePublicationBundlePayload(fixture)).toEqual([]);
    expect(validatePublicationBundle(signedFixture)).toEqual([]);
    expect(definePublicationBundlePayload(fixture)).toBe(fixture);
    expect(JSON.parse(JSON.stringify(fixture))).toEqual(fixture);
    expect(JSON.parse(JSON.stringify(signedFixture))).toEqual(signedFixture);
  });

  it('rejects schema drift, version gaps, target mismatches, duplicate kinds, and missing profile records', () => {
    const schemaDrift = { ...fixture, schemaVersion: 'dg-os.publication-bundle/v2' };
    const recordSchemaDrift = {
      ...fixture,
      records: [
        { ...fixture.records[0], schemaVersion: 'dg-os.profile-projection/v2' },
        ...fixture.records.slice(1),
      ],
    };
    const versionGap = {
      ...fixture,
      target: { ...fixture.target, proposedProjectionVersion: 3 },
    };
    const targetMismatch = {
      ...fixture,
      records: [
        { ...fixture.records[0], profileId: 'another_profile' },
        ...fixture.records.slice(1),
      ],
    };
    const duplicateKind = {
      ...fixture,
      records: [...fixture.records, { ...fixture.records[0], recordId: 'profile-copy' }],
    };
    const missingProfile = {
      ...fixture,
      records: fixture.records.filter((record) => record.kind !== 'profile'),
    };

    expect(validatePublicationBundlePayload(schemaDrift)).toContainEqual({
      path: 'schemaVersion',
      message: 'Unsupported publication bundle schema.',
    });
    expect(validatePublicationBundlePayload(recordSchemaDrift)).toContainEqual({
      path: 'records[0].schemaVersion',
      message: 'Record schema does not match its kind.',
    });
    expect(validatePublicationBundlePayload(versionGap)).toContainEqual({
      path: 'target.proposedProjectionVersion',
      message: 'Proposed projection version must immediately follow the base version.',
    });
    expect(validatePublicationBundlePayload(targetMismatch)).toContainEqual({
      path: 'records[0].profileId',
      message: 'Record profile must match the target.',
    });
    expect(validatePublicationBundlePayload(duplicateKind)).toContainEqual({
      path: `records[${fixture.records.length}].kind`,
      message: 'Record kinds must be unique within a bundle.',
    });
    expect(validatePublicationBundlePayload(missingProfile)).toContainEqual({
      path: 'records',
      message: 'A bundle must reference exactly one profile record.',
    });
  });

  it('rejects unsupported preparer pairs and hidden authority fields', () => {
    const unsupportedAgent = {
      ...fixture,
      preparedBy: {
        kind: 'agent',
        actorId: 'agent_fixture',
        provider: 'openai',
        client: 'claude-code',
        installationId: 'installation_fixture',
      },
    };
    const hiddenSecret = {
      ...fixture,
      approval: {
        ...fixture.approval,
        accessToken: 'should-never-cross-the-boundary',
      },
    };

    expect(validatePublicationBundlePayload(unsupportedAgent)).toContainEqual({
      path: 'preparedBy',
      message: 'Agent provider and client must use a supported pairing.',
    });
    expect(validatePublicationBundlePayload(hiddenSecret)).toEqual(
      expect.arrayContaining([
        {
          path: 'approval.accessToken',
          message: 'Unknown fields are forbidden in signed publication data.',
        },
        {
          path: 'approval.accessToken',
          message: 'Secret-bearing fields are forbidden.',
        },
      ])
    );
  });

  it('rejects embedded local paths, internal source metadata, and non-JSON values', () => {
    const privatePath = {
      ...fixture,
      workspaceId: 'Draft stored at /Users/name/private.md',
    };
    const internalSource = {
      ...fixture,
      target: { ...fixture.target, sourcePath: '/home/name/profile.json' },
    };
    const nonJson = {
      ...fixture,
      assets: [{ ...fixture.assets[0], byteLength: Number.POSITIVE_INFINITY }],
    };
    const impossibleDate = { ...fixture, createdAt: '2026-02-31T08:00:00Z' };

    expect(validatePublicationBundlePayload(privatePath)).toContainEqual({
      path: 'workspaceId',
      message: 'Publication bundles cannot contain local filesystem paths.',
    });
    expect(validatePublicationBundlePayload(internalSource)).toEqual(
      expect.arrayContaining([
        { path: 'target.sourcePath', message: 'Internal source metadata is forbidden.' },
        {
          path: 'target.sourcePath',
          message: 'Unknown fields are forbidden in signed publication data.',
        },
      ])
    );
    expect(validatePublicationBundlePayload(nonJson)).toContainEqual({
      path: 'assets[0].byteLength',
      message: 'Publication bundles cannot contain non-finite numbers.',
    });
    expect(validatePublicationBundlePayload(impossibleDate)).toContainEqual({
      path: 'createdAt',
      message: 'Creation time must be an ISO UTC timestamp.',
    });
  });

  it('keeps compile-time compatibility tied to the complete v1 payload shape', () => {
    const typedFixture: PublicationBundlePayloadV1 = fixture;
    expect(typedFixture.target.handle).toBe('contract-fixture');
  });

  it('allows version zero as the base of a profile first publication', () => {
    const firstPublication = {
      ...fixture,
      target: {
        ...fixture.target,
        baseProjectionVersion: 0,
        proposedProjectionVersion: 1,
      },
      records: fixture.records.map((record) => ({ ...record, projectionVersion: 1 })),
    };

    expect(validatePublicationBundlePayload(firstPublication)).toEqual([]);
  });
});
