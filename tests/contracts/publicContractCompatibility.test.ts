import { describe, expect, it } from 'vitest';
import projectionFixtureJson from '../fixtures/contracts/profile-projection-v1.json';
import modulesFixtureJson from '../fixtures/contracts/profile-modules-v1.json';
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

const projectionFixture = projectionFixtureJson as unknown as ProfileProjection;
const modulesFixture = modulesFixtureJson as unknown as PublicProfileModules;

describe('public contract compatibility', () => {
  it('keeps committed v1 projection and module fixtures valid and serialisable', () => {
    expect(PROFILE_PROJECTION_SCHEMA_VERSION).toBe('dg-os.profile-projection/v1');
    expect(PROFILE_MODULES_SCHEMA_VERSION).toBe('dg-os.profile-modules/v1');
    expect(validateProfileProjection(projectionFixture)).toEqual([]);
    expect(validatePublicProfileModules(modulesFixture)).toEqual([]);
    expect(JSON.parse(JSON.stringify(projectionFixture))).toEqual(projectionFixture);
    expect(JSON.parse(JSON.stringify(modulesFixture))).toEqual(modulesFixture);
  });

  it('activates the fixture through the same registries used by public profiles', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([modulesFixture], profiles);

    expect(createActiveProfileRuntime(projectionFixture).handle).toBe('contract-fixture');
    expect(modules.resolve('contract-fixture').profileId).toBe('contract_fixture');
    expect(modules.find('missing')).toBeUndefined();
  });

  it('rejects silent schema changes and cross-version registration', () => {
    const invalidProjection = {
      ...projectionFixture,
      schemaVersion: 'dg-os.profile-projection/v2',
    } as unknown as ProfileProjection;
    const invalidModules = {
      ...modulesFixture,
      projectionVersion: 2,
    } as PublicProfileModules;
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
