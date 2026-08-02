import { describe, expect, it } from 'vitest';
import { profileModulesV1Fixture as modulesFixture } from '../fixtures/contracts/profileModulesV1';
import { profileProjectionV1Fixture as projectionFixture } from '../fixtures/contracts/profileProjectionV1';
import { writingModuleV1Fixture as writingFixture } from '../fixtures/contracts/writingModuleV1';
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
  createPublicWritingModuleRegistry,
  PUBLIC_WRITING_SCHEMA_VERSION,
  validatePublicWritingModule,
} from '../../src/profiles/writing';

describe('public contract compatibility', () => {
  it('keeps committed v1 projection and module fixtures valid and serialisable', () => {
    expect(PROFILE_PROJECTION_SCHEMA_VERSION).toBe('dg-os.profile-projection/v1');
    expect(PROFILE_MODULES_SCHEMA_VERSION).toBe('dg-os.profile-modules/v1');
    expect(PUBLIC_WRITING_SCHEMA_VERSION).toBe('dg-os.profile-writing/v1');
    expect(validateProfileProjection(projectionFixture)).toEqual([]);
    expect(validatePublicProfileModules(modulesFixture)).toEqual([]);
    expect(validatePublicWritingModule(writingFixture)).toEqual([]);
    expect(JSON.parse(JSON.stringify(projectionFixture))).toEqual(projectionFixture);
    expect(JSON.parse(JSON.stringify(modulesFixture))).toEqual(modulesFixture);
    expect(JSON.parse(JSON.stringify(writingFixture))).toEqual(writingFixture);
  });

  it('activates the fixture through the same registries used by public profiles', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([modulesFixture], profiles);
    const writing = createPublicWritingModuleRegistry([writingFixture], profiles);

    expect(createActiveProfileRuntime(projectionFixture).handle).toBe('contract-fixture');
    expect(modules.resolve('contract-fixture').profileId).toBe('contract_fixture');
    expect(modules.find('missing')).toBeUndefined();
    expect(writing.resolve('contract-fixture').entries[0].id).toBe('fixture-writing');
    expect(writing.find('missing')).toBeUndefined();
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
