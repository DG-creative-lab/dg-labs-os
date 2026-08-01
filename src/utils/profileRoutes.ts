const PUBLIC_PROFILE_PATH_PATTERN = /^\/@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function isPublicProfilePath(pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return PUBLIC_PROFILE_PATH_PATTERN.test(normalizedPath);
}
