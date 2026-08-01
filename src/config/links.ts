import { dessiProfileProjection, type ProfileLink } from '../profiles';

export type PublicLinkKind = 'profile' | 'code' | 'publication' | 'platform' | 'contact';
export type LinkTrust = 'high' | 'medium' | 'low';

export type PublicLink = {
  id: string;
  label: string;
  url: string;
  kind: PublicLinkKind;
  tags: readonly string[];
  trust: LinkTrust;
  inDockLinks: boolean;
  verifyEligible: boolean;
};

const profileLinks: readonly ProfileLink[] = dessiProfileProjection.links;

export const publicLinks: readonly PublicLink[] = profileLinks.map((link) => ({
  id: link.id,
  label: link.label,
  url: link.url,
  kind: link.kind,
  tags: link.tags,
  trust: link.trust,
  inDockLinks: link.surfaces.includes('dock'),
  verifyEligible: link.surfaces.includes('verification'),
}));

export const dockLinks = publicLinks.filter((item) => item.inDockLinks);
export const verificationLinks = publicLinks.filter(
  (item) => item.verifyEligible && /^https?:\/\//i.test(item.url)
);
