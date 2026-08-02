export const PUBLIC_PROFILE_MODULE_IDS = ['workbench', 'writing', 'evolution', 'network'] as const;

export type PublicProfileModuleId = (typeof PUBLIC_PROFILE_MODULE_IDS)[number];

const PROFILE_HANDLE_SOURCE = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const PROFILE_MODULE_SOURCE = `(?:${PUBLIC_PROFILE_MODULE_IDS.join('|')})`;
const PUBLIC_PROFILE_PATH_PATTERN = new RegExp(
  `^/@${PROFILE_HANDLE_SOURCE}(?:/${PROFILE_MODULE_SOURCE})?$`
);

export function isPublicProfileModuleId(value: string): value is PublicProfileModuleId {
  return PUBLIC_PROFILE_MODULE_IDS.some((moduleId) => moduleId === value);
}

export function getPublicProfileModulePath(
  handle: string,
  moduleId: PublicProfileModuleId
): string {
  return `/@${handle}/${moduleId}`;
}

export function getPublicProfileModuleCanonicalUrl(
  profile: { handle: string; contact: { website: string } },
  moduleId: PublicProfileModuleId
): string {
  return new URL(
    getPublicProfileModulePath(profile.handle, moduleId),
    profile.contact.website
  ).toString();
}

export function isPublicProfilePath(pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return PUBLIC_PROFILE_PATH_PATTERN.test(normalizedPath);
}
