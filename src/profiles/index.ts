export * from './contracts';
export * from './validation';
export { dessiProfileProjection } from './dessi';

import type { ProfileLink, ProfileProjection } from './contracts';

export function getRequiredProfileLink(projection: ProfileProjection, linkId: string): ProfileLink {
  const link = projection.links.find((candidate) => candidate.id === linkId);
  if (!link) throw new Error(`Profile link not found: ${linkId}`);
  return link;
}
