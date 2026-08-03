import type { ProfileCv } from './contracts';
import {
  publicProfileRegistry,
  type ActiveProfileRuntime,
  type PublicProfileRegistry,
} from './runtime';

export type ResolvedProfileCv = {
  profile: ActiveProfileRuntime;
  cv: ProfileCv;
  variant: 'primary' | 'targeted';
};

export function findProfileCv(profile: ActiveProfileRuntime, cvId: string): ProfileCv | undefined {
  if (profile.cv.primary.id === cvId) return profile.cv.primary;
  return profile.cv.variants.find((candidate) => candidate.id === cvId);
}

export function resolveProfileCv(profile: ActiveProfileRuntime, cvId: string): ProfileCv {
  const cv = findProfileCv(profile, cvId);
  if (!cv) throw new Error(`Published CV not found for @${profile.handle}: ${cvId}`);
  return cv;
}

export function findPublicProfileCv(
  handle: string,
  cvId: string,
  profiles: PublicProfileRegistry = publicProfileRegistry
): ResolvedProfileCv | undefined {
  const profile = profiles.find(handle);
  if (!profile) return undefined;

  const cv = findProfileCv(profile, cvId);
  if (!cv) return undefined;

  return {
    profile,
    cv,
    variant: cv.id === profile.cv.primary.id ? 'primary' : 'targeted',
  };
}

export function resolvePublicProfileCv(
  handle: string,
  cvId: string,
  profiles: PublicProfileRegistry = publicProfileRegistry
): ResolvedProfileCv {
  const profile = profiles.resolve(handle);
  const cv = resolveProfileCv(profile, cvId);
  return {
    profile,
    cv,
    variant: cv.id === profile.cv.primary.id ? 'primary' : 'targeted',
  };
}
