export const PROFILE_PROJECTION_SCHEMA_VERSION = 'dg-os.profile-projection/v1' as const;

export type ProfileProjectionSchemaVersion = typeof PROFILE_PROJECTION_SCHEMA_VERSION;
export type ProfileProjectionStatus = 'draft' | 'published' | 'withdrawn';
export type ProfileVisibility = 'public';
export type ProfileLinkKind = 'profile' | 'code' | 'publication' | 'platform' | 'contact';
export type ProfileLinkTrust = 'high' | 'medium' | 'low';

export type ProfileIdentity = {
  displayName: string;
  preferredName: string;
  ownerName: string;
  aliases: readonly string[];
  role: string;
  location: string;
  roleFocus: string;
  headline: string;
  introduction: string;
};

export type ProfileContact = {
  publicEmail: string;
  website: string;
};

export type ProfileLink = {
  id: string;
  label: string;
  url: string;
  kind: ProfileLinkKind;
  tags: readonly string[];
  trust: ProfileLinkTrust;
  surfaces: readonly ('dock' | 'verification' | 'profile')[];
};

export type ProfileCv = {
  id: string;
  label: string;
  files: {
    pdf: string;
    docx: string;
    markdown: string;
  };
};

export type ProfileSeo = {
  title: string;
  description: string;
  keywords: readonly string[];
};

export type ProfilePublication = {
  visibility: ProfileVisibility;
  approvedBy: 'owner';
  reviewedAt: string;
  publishedAt: string;
  privateSourcesExcluded: true;
  sourcePolicy: string;
};

/**
 * Portable, provider-neutral public representation of one person.
 *
 * Keep this contract JSON-serialisable. UI components, functions, secrets,
 * local filesystem paths, and private workspace identifiers do not belong in
 * a public projection.
 */
export type ProfileProjection = {
  schemaVersion: ProfileProjectionSchemaVersion;
  profileId: string;
  handle: string;
  projectionVersion: number;
  status: ProfileProjectionStatus;
  identity: ProfileIdentity;
  contact: ProfileContact;
  links: readonly ProfileLink[];
  cv: {
    primary: ProfileCv;
    variants: readonly ProfileCv[];
  };
  seo: ProfileSeo;
  publication: ProfilePublication;
};
