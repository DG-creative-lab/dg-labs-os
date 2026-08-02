export const PROFILE_MODULES_SCHEMA_VERSION = 'dg-os.profile-modules/v1' as const;

export type ProfileModulesSchemaVersion = typeof PROFILE_MODULES_SCHEMA_VERSION;

export type WorkbenchCategory = string;

export type WorkbenchItem = {
  id: string;
  category: WorkbenchCategory;
  classification: string;
  title: string;
  subtitle: string;
  summary: string;
  stack: readonly string[];
  links: Partial<{
    repo: string;
    article: string;
    demo: string;
    site: string;
  }>;
  highlights: readonly string[];
};

export type EvidenceConfidence = 'verified' | 'self-reported' | 'inferred';
export type EvidenceVisibility =
  | 'public'
  | 'collaborative-public'
  | 'private-employer'
  | 'submitted-public';

export type EvidenceLink = {
  label: string;
  url: string;
  kind: 'repository' | 'article' | 'site' | 'role';
};

export type ApplicationClaim = {
  id: string;
  statement: string;
  confidence: EvidenceConfidence;
  visibility: EvidenceVisibility;
  lastVerified: string;
  evidence: readonly EvidenceLink[];
  boundary?: string;
};

export type ApplicationCaseStudy = {
  id: string;
  title: string;
  classification: string;
  contribution: string;
  problem: string;
  intervention: string;
  evaluation: string;
  result: string;
  limitation: string;
  roleSignals: readonly string[];
  evidence: readonly EvidenceLink[];
};

export type EvolutionEntry = {
  date: string;
  kind: 'observation' | 'question' | 'experiment' | 'revision';
  title: string;
  summary: string;
  state: 'observed' | 'active' | 'reviewed';
  evidenceIds: readonly string[];
};

export type WorkbenchModule = {
  moduleId: 'workbench';
  moduleVersion: number;
  categories: readonly WorkbenchCategory[];
  categoryDescriptions: Readonly<Record<WorkbenchCategory, string>>;
  items: readonly WorkbenchItem[];
};

export type EvidenceEvolutionModule = {
  moduleId: 'evidence-evolution';
  moduleVersion: number;
  claims: readonly ApplicationClaim[];
  caseStudies: readonly ApplicationCaseStudy[];
  boundaries: readonly string[];
  entries: readonly EvolutionEntry[];
};

/**
 * Reviewed public content modules for one published profile.
 *
 * This bundle is JSON-serialisable and safe to pass to public UI islands. It
 * must never contain secrets, local paths, raw workspace activity, or internal
 * source metadata.
 */
export type PublicProfileModules = {
  schemaVersion: ProfileModulesSchemaVersion;
  profileId: string;
  handle: string;
  projectionVersion: number;
  modulesVersion: number;
  status: 'published';
  workbench: WorkbenchModule;
  evidenceEvolution: EvidenceEvolutionModule;
  publication: {
    approvedBy: 'owner';
    reviewedAt: string;
    publishedAt: string;
    privateSourcesExcluded: true;
    sourcePolicy: string;
  };
};
