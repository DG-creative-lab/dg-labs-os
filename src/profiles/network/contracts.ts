export const PUBLIC_NETWORK_SCHEMA_VERSION = 'dg-os.profile-network/v1' as const;

export type PublicNetworkSchemaVersion = typeof PUBLIC_NETWORK_SCHEMA_VERSION;
export type NetworkKind = 'Foundation' | 'Career' | 'Practice' | 'System' | 'Evidence';
export type NetworkEvidence =
  | 'Background'
  | 'Professional context'
  | 'Public artifact'
  | 'Practice';
export type NetworkEvidenceConfidence = 'verified' | 'self-reported' | 'inferred';
export type NetworkEvidenceVisibility = 'public' | 'private-employer' | 'mixed';

// Visibility describes the provenance boundary behind a published statement.
// It never permits raw private evidence to enter the public module.

export type NetworkNode = {
  id: string;
  kind: NetworkKind;
  title: string;
  subtitle: string;
  period?: string;
  evidence: NetworkEvidence;
  evidenceConfidence: NetworkEvidenceConfidence;
  evidenceVisibility: Exclude<NetworkEvidenceVisibility, 'mixed'>;
  provenance: string;
  boundary: string;
  tags: readonly string[];
  bullets: readonly string[];
  map: {
    column: 0 | 1 | 2 | 3;
    row: number;
  };
  links?: Partial<{
    url: string;
    repo: string;
    article: string;
  }>;
};

export type NetworkRelation =
  | 'informed'
  | 'led to'
  | 'built during'
  | 'applied in'
  | 'supports'
  | 'documented by'
  | 'presented by'
  | 'shares pattern with';

export type NetworkRelationship = {
  id: string;
  from: string;
  to: string;
  relation: NetworkRelation;
  evidence: string;
  confidence: 'direct' | 'supported' | 'interpretive';
  evidenceVisibility: NetworkEvidenceVisibility;
};

export type NetworkPath = {
  id: string;
  question: string;
  answer: string;
  nodeIds: readonly string[];
  relationshipIds: readonly string[];
};

/**
 * Reviewed public relationships for one published profile.
 *
 * The module is JSON-serialisable and may describe a private evidence boundary,
 * but it must never contain raw private evidence, local paths, secrets, or
 * internal workspace identifiers.
 */
export type PublicNetworkModule = {
  schemaVersion: PublicNetworkSchemaVersion;
  profileId: string;
  handle: string;
  projectionVersion: number;
  networkVersion: number;
  status: 'published';
  title: string;
  description: string;
  nodes: readonly NetworkNode[];
  relationships: readonly NetworkRelationship[];
  paths: readonly NetworkPath[];
  publication: {
    approvedBy: 'owner';
    reviewedAt: string;
    publishedAt: string;
    privateSourcesExcluded: true;
    sourcePolicy: string;
  };
};
