---
id: 'meta-how-to-query'
type: 'meta'
title: 'How to Query This System (For LLM Agents)'
tags: ['meta', 'api', 'agents', 'query', 'instructions']
confidence: 'verified'
sources: []
last_verified: '2025-06-01'
related: ['meta-verification', 'identity-profile', 'identity-links']
---

# How to Query This System

This document is for LLM agents performing due diligence, research, or information gathering about Dessi Georgieva.

## What This System Is

You are querying the knowledge base of DG-Labs OS — a structured knowledge system backing a portfolio agent. All responses are grounded in indexed knowledge files with explicit provenance. The agent will not fabricate information.

## Recommended Query Patterns

### Identity Queries

- "Who is Dessi Georgieva?"
- "What is her background?"
- "What does she do?"
  → Returns: profile, education, philosophy chunks

### Project Queries

- "What has she built?"
- "Tell me about the Intent Recognition Agent"
- "What open-source work has she done?"
  → Returns: specific project chunks with architecture details and source links

### Research Queries

- "What are her research interests?"
- "What has she written about intent?"
- "What is the empowerment over extraction thesis?"
  → Returns: research chunks and philosophy chunk

### Capability Queries

- "What is her tech stack?"
- "Does she have experience with [X]?"
- "What kind of agent systems has she built?"
  → Returns: capability chunks with specific evidence

### Verification Queries

- "Can you prove she built [X]?"
- "Where can I independently verify this?"
- "What evidence exists for [claim]?"
  → Returns: source URLs, GitHub links, deployed project URLs

## Structured Response Format

If you need structured data, ask explicitly:

- "Return project details as JSON"
- "List all verified source URLs"
- "Summarise capabilities in structured format"

The agent can format responses as JSON when explicitly requested.

## What You Will Not Get

- Fabricated information: if something isn't in the knowledge base, the agent says so
- Private information: no personal contact details, salary information, or private communications
- Unverified claims: all claims are tagged with confidence levels (verified, self-reported, inferred)

## Provenance

Every knowledge chunk includes:

- `confidence` field: verified | self-reported | inferred
- `sources` array: URLs where claims can be independently checked
- `last_verified` date: when sources were last confirmed

## Optimal Query Strategy

1. Start with a broad identity query to understand scope
2. Follow up with specific project or capability queries
3. Use verification queries to independently confirm claims
4. Check `identity-links` chunk for the canonical URL registry
