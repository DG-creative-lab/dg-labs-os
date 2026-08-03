export * from './contracts';
export * from './validation';
export * from './runtime';
export * from './cvRuntime';
export { dessiProfileProjection } from './dessi';
export { activeProfileModules, findPublicProfileModules } from './modules/runtime';
export { activeNetworkModule, findPublicNetworkModule } from './network/runtime';
export { activeWritingModule, findPublicWritingModule } from './writing/runtime';
export type { PublicProfileModules } from './modules/contracts';
export type { PublicNetworkModule } from './network/contracts';
export type { PublicWritingModule } from './writing/contracts';

import type { ProfileLink, ProfileProjection } from './contracts';

export function getRequiredProfileLink(projection: ProfileProjection, linkId: string): ProfileLink {
  const link = projection.links.find((candidate) => candidate.id === linkId);
  if (!link) throw new Error(`Profile link not found: ${linkId}`);
  return link;
}
