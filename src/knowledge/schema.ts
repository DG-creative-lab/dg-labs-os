export type KnowledgeType =
  | 'identity'
  | 'experience'
  | 'project'
  | 'research'
  | 'capability'
  | 'meta';

export type ConfidenceLevel = 'verified' | 'self-reported' | 'inferred';

export type KnowledgeEntry = {
  id: string;
  type: KnowledgeType;
  title: string;
  tags: string[];
  confidence: ConfidenceLevel;
  sources: string[];
  lastVerified: string;
  related: string[];
  content: string;
  tokenEstimate: number;
  file: string;
};

export type KnowledgeHit = KnowledgeEntry & {
  score: number;
};

export type QueryClassification =
  | 'identity'
  | 'project'
  | 'research'
  | 'capability'
  | 'verification'
  | 'meta'
  | 'experience'
  | 'navigation';
