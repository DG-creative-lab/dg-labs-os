export const PUBLIC_WRITING_SCHEMA_VERSION = 'dg-os.profile-writing/v1' as const;

export type PublicWritingSchemaVersion = typeof PUBLIC_WRITING_SCHEMA_VERSION;

export type PublicWritingKind =
  | 'Build note'
  | 'Implementation guide'
  | 'Reference architecture'
  | 'Technical analysis';

export type PublicWritingEntry = {
  id: string;
  kind: PublicWritingKind;
  title: string;
  subtitle: string;
  readingTime: string;
  publishedOn: string;
  reviewedOn: string;
  status: 'published';
  url: string;
  topics: readonly string[];
  relatedSystem: string;
  boundary: string;
  authorship: {
    byline: string;
    contribution: string;
    contributionConfidence: 'verified' | 'self-reported';
  };
  evidence: readonly {
    label: string;
    url: string;
    kind: 'article' | 'archive' | 'repository' | 'site';
  }[];
};

/**
 * Reviewed public writing for one published profile.
 *
 * The publication byline and the profile owner's contribution are separate
 * claims. This module must remain JSON-serialisable and cannot contain drafts,
 * local source paths, private workspace identifiers, or unpublished notes.
 */
export type PublicWritingModule = {
  schemaVersion: PublicWritingSchemaVersion;
  profileId: string;
  handle: string;
  projectionVersion: number;
  writingVersion: number;
  status: 'published';
  title: string;
  description: string;
  entries: readonly PublicWritingEntry[];
  archive: {
    label: string;
    url: string;
    boundary: string;
  };
  publication: {
    approvedBy: 'owner';
    reviewedAt: string;
    publishedAt: string;
    privateSourcesExcluded: true;
    sourcePolicy: string;
  };
};
