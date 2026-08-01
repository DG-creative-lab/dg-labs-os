import type { ProfileLink, ProfileProjection } from './contracts';
import { dessiProfileProjection } from './dessi';
import { validateProfileProjection } from './validation';

export const DEFAULT_PROFILE_HANDLE = 'dessi' as const;

export type ActiveProfileRuntime = {
  profileId: string;
  handle: string;
  projectionVersion: number;
  identity: ProfileProjection['identity'] & {
    possessiveName: string;
  };
  contact: ProfileProjection['contact'];
  links: readonly ProfileLink[];
  cv: ProfileProjection['cv'];
  seo: ProfileProjection['seo'];
  publication: Pick<
    ProfileProjection['publication'],
    'visibility' | 'reviewedAt' | 'publishedAt' | 'sourcePolicy'
  >;
};

export type PublicProfileRegistry = {
  list: () => readonly ActiveProfileRuntime[];
  find: (handle: string) => ActiveProfileRuntime | undefined;
  resolve: (handle: string) => ActiveProfileRuntime;
};

const toPossessive = (name: string): string => (name.endsWith('s') ? `${name}'` : `${name}'s`);

/**
 * Produce the public, framework-neutral state consumed by DG-OS surfaces.
 * Draft and invalid projections cannot become an active public profile.
 */
export function createActiveProfileRuntime(projection: ProfileProjection): ActiveProfileRuntime {
  const issues = validateProfileProjection(projection);
  if (issues.length) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Cannot activate invalid profile projection:\n${summary}`);
  }
  if (projection.status !== 'published') {
    throw new Error(`Cannot activate profile with status: ${projection.status}`);
  }

  return {
    profileId: projection.profileId,
    handle: projection.handle,
    projectionVersion: projection.projectionVersion,
    identity: {
      ...projection.identity,
      possessiveName: toPossessive(projection.identity.preferredName),
    },
    contact: projection.contact,
    links: projection.links,
    cv: projection.cv,
    seo: projection.seo,
    publication: {
      visibility: projection.publication.visibility,
      reviewedAt: projection.publication.reviewedAt,
      publishedAt: projection.publication.publishedAt,
      sourcePolicy: projection.publication.sourcePolicy,
    },
  };
}

export function createPublicProfileRegistry(
  projections: readonly ProfileProjection[]
): PublicProfileRegistry {
  const profiles = new Map<string, ActiveProfileRuntime>();

  for (const projection of projections) {
    if (profiles.has(projection.handle)) {
      throw new Error(`Duplicate published profile handle: ${projection.handle}`);
    }
    profiles.set(projection.handle, createActiveProfileRuntime(projection));
  }

  return {
    list: () => [...profiles.values()],
    find: (handle) => profiles.get(handle),
    resolve: (handle) => {
      const profile = profiles.get(handle);
      if (!profile) throw new Error(`Published profile not found: ${handle}`);
      return profile;
    },
  };
}

export const publicProfileRegistry = createPublicProfileRegistry([dessiProfileProjection]);

export function findActiveProfile(handle: string): ActiveProfileRuntime | undefined {
  return publicProfileRegistry.find(handle);
}

export function resolveActiveProfile(
  handle: string = DEFAULT_PROFILE_HANDLE
): ActiveProfileRuntime {
  return publicProfileRegistry.resolve(handle);
}

export const activeProfile = resolveActiveProfile();

export function getPublicProfilePath(profile: Pick<ActiveProfileRuntime, 'handle'>): string {
  return `/@${profile.handle}`;
}

export function getPublicProfileCanonicalUrl(
  profile: Pick<ActiveProfileRuntime, 'handle' | 'contact'>
): string {
  return new URL(getPublicProfilePath(profile), profile.contact.website).toString();
}
