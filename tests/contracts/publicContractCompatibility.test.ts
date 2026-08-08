import { describe, expect, it } from 'vitest';
import { profileModulesV1Fixture as modulesFixture } from '../fixtures/contracts/profileModulesV1';
import { networkModuleV1Fixture as networkFixture } from '../fixtures/contracts/networkModuleV1';
import { profileProjectionV1Fixture as projectionFixture } from '../fixtures/contracts/profileProjectionV1';
import { writingModuleV1Fixture as writingFixture } from '../fixtures/contracts/writingModuleV1';
import { resumeModuleV1Fixture as resumeFixture } from '../fixtures/contracts/resumeModuleV1';
import {
  publicationBundlePayloadV1Fixture as publicationPayloadFixture,
  publicationBundleV1Fixture as publicationFixture,
} from '../fixtures/contracts/publicationBundleV1';
import { publicationVerificationApiEnvelopeV1Fixture as publicationVerificationFixture } from '../fixtures/contracts/publicationVerificationV1';
import {
  createActiveProfileRuntime,
  createPublicProfileRegistry,
  PROFILE_PROJECTION_SCHEMA_VERSION,
  type ProfileProjection,
  validateProfileProjection,
} from '../../src/profiles';
import {
  createPublicProfileModuleRegistry,
  PROFILE_MODULES_SCHEMA_VERSION,
  type PublicProfileModules,
  validatePublicProfileModules,
} from '../../src/profiles/modules';
import {
  createPublicNetworkModuleRegistry,
  PUBLIC_NETWORK_SCHEMA_VERSION,
  validatePublicNetworkModule,
} from '../../src/profiles/network';
import {
  createPublicWritingModuleRegistry,
  PUBLIC_WRITING_SCHEMA_VERSION,
  validatePublicWritingModule,
} from '../../src/profiles/writing';
import {
  createPublicResumeModuleRegistry,
  PUBLIC_RESUME_SCHEMA_VERSION,
  validatePublicResumeModule,
} from '../../src/profiles/resume';
import {
  isPublicationVerificationApiEnvelopeV1,
  PUBLICATION_BUNDLE_SCHEMA_VERSION,
  PUBLICATION_VERIFICATION_SCHEMA_VERSION,
  validatePublicationBundle,
  validatePublicationBundlePayload,
} from '../../src/publication';

describe('public contract compatibility', () => {
  it('keeps committed v1 projection and module fixtures valid and serialisable', () => {
    expect(PROFILE_PROJECTION_SCHEMA_VERSION).toBe('dg-os.profile-projection/v1');
    expect(PROFILE_MODULES_SCHEMA_VERSION).toBe('dg-os.profile-modules/v1');
    expect(PUBLIC_NETWORK_SCHEMA_VERSION).toBe('dg-os.profile-network/v1');
    expect(PUBLIC_WRITING_SCHEMA_VERSION).toBe('dg-os.profile-writing/v1');
    expect(PUBLIC_RESUME_SCHEMA_VERSION).toBe('dg-os.profile-resume/v1');
    expect(PUBLICATION_BUNDLE_SCHEMA_VERSION).toBe('dg-os.publication-bundle/v1');
    expect(PUBLICATION_VERIFICATION_SCHEMA_VERSION).toBe('dg-os.publication-verification/v1');
    expect(validateProfileProjection(projectionFixture)).toEqual([]);
    expect(validatePublicProfileModules(modulesFixture)).toEqual([]);
    expect(validatePublicNetworkModule(networkFixture)).toEqual([]);
    expect(validatePublicWritingModule(writingFixture)).toEqual([]);
    expect(validatePublicResumeModule(resumeFixture)).toEqual([]);
    expect(validatePublicationBundlePayload(publicationPayloadFixture)).toEqual([]);
    expect(validatePublicationBundle(publicationFixture)).toEqual([]);
    expect(isPublicationVerificationApiEnvelopeV1(publicationVerificationFixture)).toBe(true);
    expect(JSON.parse(JSON.stringify(projectionFixture))).toEqual(projectionFixture);
    expect(JSON.parse(JSON.stringify(modulesFixture))).toEqual(modulesFixture);
    expect(JSON.parse(JSON.stringify(networkFixture))).toEqual(networkFixture);
    expect(JSON.parse(JSON.stringify(writingFixture))).toEqual(writingFixture);
    expect(JSON.parse(JSON.stringify(resumeFixture))).toEqual(resumeFixture);
    expect(JSON.parse(JSON.stringify(publicationPayloadFixture))).toEqual(
      publicationPayloadFixture
    );
    expect(JSON.parse(JSON.stringify(publicationFixture))).toEqual(publicationFixture);
    expect(JSON.parse(JSON.stringify(publicationVerificationFixture))).toEqual(
      publicationVerificationFixture
    );
  });

  it('activates the fixture through the same registries used by public profiles', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([modulesFixture], profiles);
    const network = createPublicNetworkModuleRegistry([networkFixture], profiles);
    const writing = createPublicWritingModuleRegistry([writingFixture], profiles);
    const resumes = createPublicResumeModuleRegistry([resumeFixture], profiles, modules);

    expect(createActiveProfileRuntime(projectionFixture).handle).toBe('contract-fixture');
    expect(modules.resolve('contract-fixture').profileId).toBe('contract_fixture');
    expect(modules.find('missing')).toBeUndefined();
    expect(network.resolve('contract-fixture').nodes[0].id).toBe('fixture-foundation');
    expect(network.find('missing')).toBeUndefined();
    expect(writing.resolve('contract-fixture').entries[0].id).toBe('fixture-writing');
    expect(writing.find('missing')).toBeUndefined();
    expect(resumes.resolve('contract-fixture').experience[0].id).toBe('fixture-role');
    expect(resumes.find('missing')).toBeUndefined();
  });

  it('rejects silent schema changes and cross-version registration', () => {
    const invalidProjection = {
      ...projectionFixture,
      schemaVersion: 'dg-os.profile-projection/v2',
    } as unknown as ProfileProjection;
    const invalidModules = {
      ...modulesFixture,
      projectionVersion: 2,
    } satisfies PublicProfileModules;
    const profiles = createPublicProfileRegistry([projectionFixture]);

    expect(validateProfileProjection(invalidProjection)).toContainEqual({
      path: 'schemaVersion',
      message: 'Unsupported profile projection schema.',
    });
    expect(() => createPublicProfileModuleRegistry([invalidModules], profiles)).toThrow(
      'projection version does not match profile'
    );
  });
});
