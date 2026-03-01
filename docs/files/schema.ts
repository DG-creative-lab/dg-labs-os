// src/knowledge/schema.ts
// Type definitions for the DG-Labs OS agent knowledge base

export type KnowledgeType =
  | "identity"
  | "experience"
  | "project"
  | "research"
  | "capability"
  | "meta";

export type ConfidenceLevel =
  | "verified"      // linked to public, independently checkable evidence
  | "self-reported" // stated by Dessi, not independently verifiable from public sources
  | "inferred";     // derived from patterns across multiple sources

export interface KnowledgeEntry {
  id: string;
  type: KnowledgeType;
  title: string;
  tags: string[];
  confidence: ConfidenceLevel;
  sources: string[];
  lastVerified: string;        // ISO date
  related: string[];           // IDs of related chunks
  content: string;             // markdown body (raw)
  tokenEstimate: number;       // approximate token count for context budgeting
}

export interface KnowledgeQuery {
  raw: string;                 // original user input
  classification: QueryClassification;
  matchedIds: string[];        // chunks selected for context
  totalTokens: number;         // token budget used
}

export type QueryClassification =
  | "identity"      // who is Dessi, background, about
  | "project"       // what has she built, specific project questions
  | "research"      // ideas, deep dives, research themes
  | "capability"    // tech stack, skills, experience with X
  | "verification"  // prove it, where can I see, is this real
  | "meta"          // how does this system work
  | "experience"    // work history, roles, career path
  | "navigation";   // open app, go to, show me

export interface RetrievalResult {
  chunks: KnowledgeEntry[];
  classification: QueryClassification;
  tokenBudgetUsed: number;
  tokenBudgetMax: number;
}

// For LLM agent consumers — structured response format
export interface AgentQueryResponse {
  query: string;
  classification: QueryClassification;
  answer: string;
  sources: Array<{
    url: string;
    description: string;
    confidence: ConfidenceLevel;
    lastVerified: string;
  }>;
  relatedTopics: string[];
  suggestedFollowUp: string[];
}
