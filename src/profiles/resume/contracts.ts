export const PUBLIC_RESUME_SCHEMA_VERSION = 'dg-os.profile-resume/v1' as const;

export type PublicResumeSchemaVersion = typeof PUBLIC_RESUME_SCHEMA_VERSION;

export type PublicResumeIssue = {
  path: string;
  message: string;
};

export type ResumeContactReference =
  | { kind: 'public-email' }
  | { kind: 'website'; label: string }
  | { kind: 'profile-link'; linkId: string };

export type ResumeFocusArea = {
  label: string;
  detail: string;
};

export type ResumeSystemSelection = {
  workbenchItemId: string;
  evidenceClaimIds: readonly string[];
  workbenchHighlightIndexes: readonly number[];
  primaryLink: 'repo' | 'article' | 'demo' | 'site';
  linkLabel: string;
};

export type ResumeExperience = {
  id: string;
  title: string;
  organisation: string;
  location: string;
  startedAt: string;
  endedAt: string | null;
  highlights: readonly string[];
  evidenceClaimIds: readonly string[];
  boundary?: string;
};

export type ResumeEducation = {
  id: string;
  qualification: string;
  institution: string;
  startedAt: string;
  endedAt: string;
};

/**
 * Reviewed public Resume content for one profile.
 *
 * Project and evidence prose is selected by stable IDs from the owning public
 * profile modules. Raw source paths, private evidence and renderer metadata do
 * not belong in this contract.
 */
export type PublicResumeModule = {
  schemaVersion: PublicResumeSchemaVersion;
  profileId: string;
  handle: string;
  projectionVersion: number;
  resumeVersion: number;
  status: 'published';
  roleTitle: string;
  summary: string;
  contact: readonly ResumeContactReference[];
  focusAreas: readonly ResumeFocusArea[];
  selectedSystems: readonly ResumeSystemSelection[];
  experience: readonly ResumeExperience[];
  education: readonly ResumeEducation[];
  publication: {
    approvedBy: 'owner';
    reviewedAt: string;
    publishedAt: string;
    privateSourcesExcluded: true;
    sourcePolicy: string;
  };
};
