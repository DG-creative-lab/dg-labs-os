export const PUBLIC_PROFILE_MODULE_IDS = [
  'workbench',
  'writing',
  'evolution',
  'network',
  'resume',
] as const;

export type PublicProfileModuleId = (typeof PUBLIC_PROFILE_MODULE_IDS)[number];

const PROFILE_HANDLE_SOURCE = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const PROFILE_MODULE_SEGMENT_SOURCE = '[^/]+';
const PUBLIC_PROFILE_PATH_SHAPE_PATTERN = new RegExp(
  `^/@(${PROFILE_HANDLE_SOURCE})(?:/(${PROFILE_MODULE_SEGMENT_SOURCE}))?$`
);

export type PublicProfilePathShape = {
  handle: string;
  moduleId?: string;
};

const normalizeProfilePath = (pathname: string): string => pathname.replace(/\/+$/, '') || '/';

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

export function matchPublicProfilePathShape(pathname: string): PublicProfilePathShape | null {
  const match = PUBLIC_PROFILE_PATH_SHAPE_PATTERN.exec(normalizeProfilePath(pathname));
  if (!match) return null;

  const [, handle, moduleId] = match;
  return moduleId ? { handle, moduleId } : { handle };
}

export function isPotentialPublicProfilePath(pathname: string): boolean {
  return matchPublicProfilePathShape(pathname) !== null;
}

export function isPublicProfilePath(pathname: string): boolean {
  const route = matchPublicProfilePathShape(pathname);
  return (
    route !== null && (route.moduleId === undefined || isPublicProfileModuleId(route.moduleId))
  );
}
