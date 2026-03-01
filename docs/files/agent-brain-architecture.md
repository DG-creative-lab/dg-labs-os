# DG-Labs OS — Agent Knowledge Base Architecture

## 1. Design Principles

The agent's knowledge base is a **file-based retrieval system** that serves as the canonical source of truth about Dessi Georgieva's identity, work, ideas, and research. It is designed to be:

- **Dual-readable**: structured for LLM retrieval, narrative for human consumption
- **Provenance-aware**: every claim links to verifiable sources (GitHub, published articles, deployed systems)
- **Chunk-optimized**: each file is a self-contained retrieval unit sized for LLM context windows (~500-1500 tokens per chunk)
- **Schema-consistent**: all files follow predictable frontmatter patterns so the agent can reason about what it knows

## 2. Directory Structure

```
src/
  knowledge/
    index.ts              # Master registry — exports all chunks with metadata
    schema.ts             # TypeScript types for knowledge entries
    identity/
      profile.md          # Core identity: who Dessi is, what she stands for
      philosophy.md       # Empowerment over extraction thesis
      education.md        # BA Philosophy (Sofia), MA Human Rights (York)
      links.md            # Canonical URLs — single source of truth for all public profiles
    experience/
      performics.md       # Current: Data Engineer → actual Research Engineer work
      prior-roles.md      # Previous experience (analytics, earlier career)
    projects/
      intent-recognition-agent.md    # 4-layer marketing intelligence system
      agentic-commerce.md            # Multi-tenant Bayesian learning loop
      ai-skills-framework.md         # Open-source ecosystem, 18 skills, Go CLI
      ai-news-hub.md                 # Content platform, 200+ followers, 50+ articles
      dg-labs-os.md                  # This portfolio itself (meta-recursive)
      hackathons.md                  # Hackathon projects and experiments
    research/
      geometry-of-intention.md       # Deep dive: intent as geometric structure
      phenomenology-of-search.md     # Deep dive: search behavior analysis
      research-themes.md             # Cross-cutting research threads
    capabilities/
      technical-stack.md             # Languages, frameworks, infrastructure
      agent-architecture.md          # Multi-agent orchestration, Bayesian systems
      ai-coding-workflow.md          # How she uses AI coding agents as a development practice
    meta/
      how-to-query.md               # Instructions for LLM agents on how to query this system
      verification.md               # What can be independently verified and how
      provenance-registry.md         # Source URLs, last-verified dates, confidence levels
```

## 3. File Schema

Every knowledge file follows this structure:

```markdown
---
id: "unique-kebab-case-id"
type: "identity" | "experience" | "project" | "research" | "capability" | "meta"
title: "Human-readable title"
tags: ["tag1", "tag2"]
confidence: "verified" | "self-reported" | "inferred"
sources: ["url1", "url2"]
last_verified: "2025-XX-XX"
related: ["other-chunk-id-1", "other-chunk-id-2"]
---

# Title

Narrative content here. Written in a factual, evidence-grounded style that an LLM
can quote or paraphrase accurately. Each paragraph should be a self-contained claim
or description.

## Key Facts

- Fact 1 (with source context)
- Fact 2
- ...

## Connections

- Links to related chunks and why they connect
```

## 4. Index Registry (index.ts)

The master index is a TypeScript file that:
- Imports all markdown files as raw strings
- Exports a typed array of `KnowledgeEntry` objects with metadata
- Provides helper functions: `getByTag()`, `getByType()`, `getById()`, `search(query)`
- Is the single import the agent runtime needs

```typescript
interface KnowledgeEntry {
  id: string;
  type: KnowledgeType;
  title: string;
  tags: string[];
  confidence: ConfidenceLevel;
  sources: string[];
  related: string[];
  content: string;       // raw markdown body
  tokenEstimate: number; // for context window budgeting
}
```

## 5. Retrieval Strategy

The agent uses a **two-pass retrieval** approach:

### Pass 1: Query Classification
Classify the incoming query into one of:
- **Identity** → "who is Dessi", "tell me about yourself", "background"
- **Project** → "what have you built", "tell me about [project name]"
- **Research** → "what do you think about [topic]", "research interests"
- **Capability** → "tech stack", "what languages", "experience with [X]"
- **Verification** → "prove it", "where can I see [X]", "is this real"
- **Meta** → "how does this system work", "what can you tell me"

### Pass 2: Chunk Selection
Based on classification, select 2-5 relevant chunks from the index.
Budget: stay under ~4000 tokens of retrieved context per response.

Priority order:
1. Exact ID match (if query references a known project/topic)
2. Tag match (highest overlap)
3. Related-chunk traversal (follow edges from best match)

### For LLM Agent Consumers
When the agent detects it's talking to another LLM (via structured query patterns, JSON requests, or explicit declaration), it can:
- Return structured JSON instead of narrative
- Include full provenance chains
- Reference the `how-to-query.md` meta file for query optimization

## 6. System Prompt Architecture

The agent's system prompt has three layers:

### Layer 1: Identity (always loaded)
~300 tokens. Who is Dessi, what is DG-Labs OS, what can the agent do.

### Layer 2: Retrieved Context (dynamic)
~2000-4000 tokens. Selected knowledge chunks based on query classification.

### Layer 3: Behavioral Rules
~200 tokens. Response style, honesty policy, what to do when it doesn't know something.

## 7. Agent Behavioral Contract

The agent:
- **Never fabricates**. If something isn't in the knowledge base, it says so.
- **Always cites sources** when making verifiable claims.
- **Distinguishes confidence levels**: "verified" claims (linked to public evidence) vs "self-reported" claims.
- **Offers navigation**: suggests which app/module to explore for more depth.
- **Adapts register**: conversational for humans, structured for LLM agents.
- **Respects the OS metaphor**: responses can reference opening apps, navigating to modules, etc.

## 8. Integration Points

### Terminal Runtime
- Deterministic commands (`projects`, `resume`, `search`) query the index directly
- `ask` command triggers LLM with retrieved context
- `context` command shows which chunks are currently loaded
- `sources` command lists provenance for last response

### Network Graph
- Knowledge chunk IDs map 1:1 to network node IDs where applicable
- "Open in Network" action from terminal response
- Graph inspector can show which chunks feed a node

### Workbench / Lab Notes
- Project chunks link to workbench entries
- Research chunks link to lab notes entries
- Cross-module navigation is bidirectional

## 9. Build Plan

### Step 1: Write the knowledge files
Populate all markdown files from existing CV documents, network config, and verified sources.

### Step 2: Build index.ts and schema.ts
Type-safe registry with search helpers.

### Step 3: Build retrieval module
Query classifier + chunk selector + context assembler.

### Step 4: Update agent system prompt
Three-layer prompt with dynamic context injection.

### Step 5: Wire to terminal runtime
Connect retrieval to existing `/api/chat` endpoint and deterministic commands.

### Step 6: Add verification layer
`sources` and `verify` commands that surface provenance from the knowledge base.
