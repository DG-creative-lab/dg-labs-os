import { describe, expect, it } from 'vitest';
import {
  createActiveProfileRuntime,
  createPublicProfileRegistry,
  dessiProfileProjection,
  type ProfileProjection,
} from '../../src/profiles';
import {
  createPublicProfileModuleRegistry,
  dessiProfileModules,
  type PublicProfileModules,
} from '../../src/profiles/modules';

describe('profile lifecycle machine properties', () => {
  it('activates published profiles and rejects every non-published lifecycle state', () => {
    expect(createActiveProfileRuntime(dessiProfileProjection).handle).toBe('dessi');

    for (const status of ['draft', 'withdrawn'] as const) {
      const projection = { ...dessiProfileProjection, status } as ProfileProjection;
      expect(() => createActiveProfileRuntime(projection)).toThrow(
        `Cannot activate profile with status: ${status}`
      );
    }
  });

  it('registers matching modules deterministically and rejects identity drift', () => {
    const profiles = createPublicProfileRegistry([dessiProfileProjection]);
    const first = createPublicProfileModuleRegistry([dessiProfileModules], profiles);
    const second = createPublicProfileModuleRegistry([dessiProfileModules], profiles);

    expect(first.resolve('dessi')).toEqual(second.resolve('dessi'));
    expect(() =>
      createPublicProfileModuleRegistry(
        [
          {
            ...dessiProfileModules,
            profileId: 'another_person',
          } as PublicProfileModules,
        ],
        profiles
      )
    ).toThrow('Profile module identity does not match profile');
  });

  it('rejects unpublished module bundles before registration', () => {
    const profiles = createPublicProfileRegistry([dessiProfileProjection]);
    const draftModules = {
      ...dessiProfileModules,
      status: 'draft',
    } as unknown as PublicProfileModules;

    expect(() => createPublicProfileModuleRegistry([draftModules], profiles)).toThrow(
      'Only published profile modules can be registered.'
    );
  });
});
