// src/knowledge/index.ts
// Master registry for the DG-Labs OS agent knowledge base
//
// This file is the single import the agent runtime needs.
// It loads all knowledge chunks, parses frontmatter, and provides
// typed search/retrieval helpers.

import type { KnowledgeEntry, KnowledgeType, QueryClassification, RetrievalResult } from './schema';

// --- Raw imports (Astro/Vite can import .md as raw strings) ---
// In production, these would be:
//   import profileRaw from './identity/profile.md?raw';
//   import philosophyRaw from './identity/philosophy.md?raw';
//   ... etc
// For now, this file defines the registry structure and retrieval logic.

// --- Chunk Registry ---
// Each entry maps to one markdown file in the knowledge/ directory.

const KNOWLEDGE_REGISTRY: Omit<KnowledgeEntry, 'content' | 'tokenEstimate'>[] = [
  // Identity
  { id: 'identity-profile',        type: 'identity',   title: 'Dessi Georgieva — Profile',                 tags: ['identity','overview','about'],                                          confidence: 'verified',      sources: ['https://www.linkedin.com/in/dessi-georgieva/','https://github.com/DG-creative-lab','https://github.com/ai-knowledge-hub'], related: ['identity-philosophy','identity-education','identity-links'] },
  { id: 'identity-philosophy',     type: 'identity',   title: 'Empowerment Over Extraction',                tags: ['philosophy','human-agency','design-principles','core-thesis'],           confidence: 'verified',      sources: ['https://ai-news-hub.performics-labs.com/'],                                                                                related: ['identity-profile','identity-education','research-themes','project-intent-recognition'] },
  { id: 'identity-education',      type: 'identity',   title: 'Education',                                  tags: ['education','philosophy','human-rights','academic'],                      confidence: 'verified',      sources: ['https://www.linkedin.com/in/dessi-georgieva/'],                                                                            related: ['identity-profile','identity-philosophy','research-themes'] },
  { id: 'identity-links',          type: 'identity',   title: 'Public Profile & Project Links',             tags: ['links','verification','profiles','github','publications'],               confidence: 'verified',      sources: [],                                                                                                                          related: ['identity-profile','meta-verification','meta-provenance'] },

  // Experience
  { id: 'experience-performics',   type: 'experience', title: 'Performics Innovations Lab — Publicis Media', tags: ['experience','current-role','marketing-intelligence','publicis'],        confidence: 'verified',      sources: ['https://www.linkedin.com/in/dessi-georgieva/','https://github.com/DG-creative-lab'],                                        related: ['project-intent-recognition','project-agentic-commerce','identity-profile'] },

  // Projects
  { id: 'project-intent-recognition', type: 'project', title: 'Intent Recognition Agent',                   tags: ['project','flagship','intent','behavioral-modeling','embeddings','clustering','llm','marketing-intelligence'], confidence: 'verified', sources: ['https://github.com/DG-creative-lab'], related: ['experience-performics','research-geometry-of-intention','identity-philosophy','capability-agent-architecture'] },
  { id: 'project-agentic-commerce',   type: 'project', title: 'Agentic Commerce Learning Loop',             tags: ['project','flagship','bayesian','learning-systems','multi-tenant','commerce','agents'],                        confidence: 'verified', sources: ['https://github.com/DG-creative-lab'], related: ['experience-performics','capability-agent-architecture','research-themes','identity-philosophy'] },
  { id: 'project-ai-skills-framework',type: 'project', title: 'AI Agent Skills Framework',                  tags: ['project','open-source','skills','agents','go','nextjs','education','ecosystem'],                             confidence: 'verified', sources: ['https://github.com/ai-knowledge-hub'], related: ['identity-philosophy','capability-technical-stack','project-ai-news-hub','research-themes'] },
  { id: 'project-ai-news-hub',        type: 'project', title: 'AI News Hub — Content Platform',             tags: ['project','writing','research','content-platform','community','astro','publications'],                        confidence: 'verified', sources: ['https://ai-news-hub.performics-labs.com/'], related: ['identity-philosophy','research-geometry-of-intention','research-phenomenology-of-search','research-themes'] },
  { id: 'project-dg-labs-os',         type: 'project', title: 'DG-Labs OS — Portfolio as Operating System',  tags: ['project','portfolio','os-metaphor','astro','react','agent','terminal'],                                      confidence: 'verified', sources: ['https://github.com/DG-creative-lab'], related: ['identity-profile','identity-philosophy','capability-technical-stack','meta-how-to-query'] },

  // Research
  { id: 'research-themes',                type: 'research', title: 'Research Themes — Cross-Cutting Threads',tags: ['research','themes','intent','agency','agents','learning-systems','phenomenology'], confidence: 'verified', sources: ['https://ai-news-hub.performics-labs.com/'], related: ['identity-philosophy','research-geometry-of-intention','research-phenomenology-of-search','project-intent-recognition','project-agentic-commerce'] },
  { id: 'research-geometry-of-intention',  type: 'research', title: 'The Geometry of Intention',             tags: ['research','deep-dive','intent','geometry','embeddings','philosophy'],                                        confidence: 'verified', sources: ['https://ai-news-hub.performics-labs.com/'], related: ['project-intent-recognition','identity-philosophy','research-themes','research-phenomenology-of-search'] },
  { id: 'research-phenomenology-of-search',type: 'research', title: 'The Phenomenology of Search',           tags: ['research','deep-dive','search','phenomenology','behavior','philosophy'],                                     confidence: 'verified', sources: ['https://ai-news-hub.performics-labs.com/'], related: ['project-intent-recognition','identity-philosophy','identity-education','research-geometry-of-intention','research-themes'] },

  // Capabilities
  { id: 'capability-technical-stack',   type: 'capability', title: 'Technical Stack & Skills',               tags: ['capability','stack','python','go','typescript','aws','fastapi','react'],                                     confidence: 'verified', sources: ['https://github.com/DG-creative-lab','https://github.com/ai-knowledge-hub'], related: ['identity-profile','experience-performics','capability-agent-architecture'] },
  { id: 'capability-agent-architecture',type: 'capability', title: 'Agent Architecture & Multi-Agent Systems',tags: ['capability','agents','orchestration','bayesian','multi-agent','architecture'],                               confidence: 'verified', sources: ['https://github.com/DG-creative-lab','https://github.com/ai-knowledge-hub'], related: ['project-intent-recognition','project-agentic-commerce','project-ai-skills-framework','research-themes'] },

  // Meta
  { id: 'meta-how-to-query',    type: 'meta', title: 'How to Query This System (For LLM Agents)',           tags: ['meta','api','agents','query','instructions'],                                                               confidence: 'verified', sources: [], related: ['meta-verification','identity-profile','identity-links'] },
  { id: 'meta-verification',    type: 'meta', title: 'Verification Guide',                                  tags: ['meta','verification','evidence','provenance'],                                                              confidence: 'verified', sources: [], related: ['identity-links','meta-how-to-query'] },
];

// --- Retrieval Helpers ---

export function getById(id: string): typeof KNOWLEDGE_REGISTRY[number] | undefined {
  return KNOWLEDGE_REGISTRY.find(e => e.id === id);
}

export function getByType(type: KnowledgeType): typeof KNOWLEDGE_REGISTRY[number][] {
  return KNOWLEDGE_REGISTRY.filter(e => e.type === type);
}

export function getByTag(tag: string): typeof KNOWLEDGE_REGISTRY[number][] {
  return KNOWLEDGE_REGISTRY.filter(e => e.tags.includes(tag));
}

export function search(query: string): typeof KNOWLEDGE_REGISTRY[number][] {
  const terms = query.toLowerCase().split(/\s+/);
  return KNOWLEDGE_REGISTRY
    .map(entry => {
      const searchable = [entry.title, ...entry.tags, entry.id].join(' ').toLowerCase();
      const score = terms.reduce((acc, term) => acc + (searchable.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}

export function getRelated(id: string, depth: number = 1): typeof KNOWLEDGE_REGISTRY[number][] {
  const seen = new Set<string>();
  const result: typeof KNOWLEDGE_REGISTRY[number][] = [];

  function traverse(currentId: string, currentDepth: number) {
    if (currentDepth > depth || seen.has(currentId)) return;
    seen.add(currentId);
    const entry = getById(currentId);
    if (!entry) return;
    if (currentId !== id) result.push(entry);
    entry.related.forEach(relId => traverse(relId, currentDepth + 1));
  }

  traverse(id, 0);
  return result;
}

// --- Query Classification ---

const CLASSIFICATION_KEYWORDS: Record<QueryClassification, string[]> = {
  identity:     ['who', 'about', 'background', 'dessi', 'georgieva', 'introduce', 'yourself', 'name'],
  project:      ['built', 'build', 'project', 'system', 'platform', 'tool', 'framework', 'intent', 'commerce', 'skills', 'news', 'portfolio'],
  research:     ['research', 'think', 'idea', 'write', 'wrote', 'article', 'deep dive', 'geometry', 'phenomenology', 'thesis', 'philosophy'],
  capability:   ['stack', 'language', 'skill', 'experience', 'know', 'use', 'python', 'go', 'typescript', 'aws', 'bayesian', 'agent'],
  verification: ['prove', 'verify', 'evidence', 'source', 'link', 'github', 'real', 'confirm', 'check'],
  meta:         ['how', 'system', 'work', 'query', 'what can you', 'help', 'terminal'],
  experience:   ['work', 'role', 'job', 'career', 'company', 'performics', 'publicis', 'position', 'history'],
  navigation:   ['open', 'show', 'go to', 'navigate', 'app', 'module'],
};

export function classifyQuery(query: string): QueryClassification {
  const lower = query.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [classification, keywords] of Object.entries(CLASSIFICATION_KEYWORDS)) {
    scores[classification] = keywords.reduce(
      (acc, kw) => acc + (lower.includes(kw) ? 1 : 0),
      0
    );
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return (best[1] > 0 ? best[0] : 'identity') as QueryClassification;
}

// --- Context Assembly ---

const TOKEN_BUDGET = 4000;
const AVG_TOKENS_PER_CHUNK = 600; // rough estimate per knowledge file
const MAX_CHUNKS = Math.floor(TOKEN_BUDGET / AVG_TOKENS_PER_CHUNK);

const CLASSIFICATION_TO_TYPES: Record<QueryClassification, KnowledgeType[]> = {
  identity:     ['identity'],
  project:      ['project'],
  research:     ['research'],
  capability:   ['capability'],
  verification: ['meta', 'identity'],
  meta:         ['meta'],
  experience:   ['experience', 'identity'],
  navigation:   ['meta'],
};

export function selectChunks(query: string): { ids: string[]; classification: QueryClassification } {
  const classification = classifyQuery(query);

  // Start with keyword search results
  const searchResults = search(query);

  // Add type-filtered results
  const typeMatches = CLASSIFICATION_TO_TYPES[classification]
    ?.flatMap(t => getByType(t)) ?? [];

  // Merge, deduplicate, and limit
  const seen = new Set<string>();
  const selected: string[] = [];

  for (const entry of [...searchResults, ...typeMatches]) {
    if (!seen.has(entry.id) && selected.length < MAX_CHUNKS) {
      seen.add(entry.id);
      selected.push(entry.id);
    }
  }

  // Always include profile for identity queries
  if (classification === 'identity' && !selected.includes('identity-profile')) {
    selected.unshift('identity-profile');
    if (selected.length > MAX_CHUNKS) selected.pop();
  }

  return { ids: selected, classification };
}

export { KNOWLEDGE_REGISTRY };
