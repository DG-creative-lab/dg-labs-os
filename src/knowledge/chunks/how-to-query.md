---
id: 'meta-how-to-query'
type: 'meta'
title: 'How to Query This System (For LLM Agents)'
tags: ['meta', 'api', 'agents', 'query', 'instructions']
confidence: 'verified'
sources: []
last_verified: '2026-08-22'
related: ['meta-verification', 'identity-profile', 'identity-links']
---

# How to Query This System

This document is for LLM agents performing due diligence, research, or information gathering about Dessi Georgieva.

## What This System Is

You are querying the approved knowledge corpus behind the DG-OS Profile Agent. The runtime retrieves indexed profile evidence and can cite verification paths. Model answers can still be incomplete or mistaken, so the typed profile, linked artifacts, confidence labels, and stated boundaries remain authoritative.

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

## Evidence Boundary

- Private workspace activity, salary information, private communications, or employer-confidential material
- Authority for the model to promote raw observations into public claims
- A guarantee that retrieval alone makes every synthesis complete or correct
- Claims without the confidence, source, and limitation fields available in the approved corpus

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
