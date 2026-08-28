---
id: 'experience-performics'
type: 'experience'
title: 'Performics Innovations Lab - Publicis Media'
tags:
  ['experience', 'current-role', 'marketing-intelligence', 'programmatic', 'publicis', 'performics']
confidence: 'self-reported'
sources:
  [
    'https://www.linkedin.com/in/dessi-georgieva/',
    'https://ai-news-hub.performics-labs.com/',
    'https://www.performancemarketingworldawards.com/finalists/unifying-retail-data-with-publicis-warehouse-7y3bxeifqg035ne',
  ]
last_verified: '2026-08-28'
related:
  [
    'project-ai-news-hub',
    'project-ai-skills-framework',
    'project-intent-recognition',
    'project-agentic-commerce',
    'identity-profile',
  ]
---

# Performics Innovations Lab - Publicis Media

**Title**: Engineer
**Location**: London, UK
**Organisation**: Performics Innovations Lab, part of Publicis Media

## Role Context

The role involves designing and building AI and data systems: FastAPI services, AWS workflows, multi-tenant platform boundaries, behavioural modelling, programmatic tools, and marketing-intelligence interfaces. Detailed code, logs, infrastructure, operational measurements, and client information remain employer-confidential.

## Core Systems Built

### Performics Labs AI News Hub

Dessi conceived, built, and maintains the open-source AI News Hub as a shared place for applied AI research in marketing. It connects short news, deeper analysis, All-Hands build sessions, and public prototypes so practitioners can move from understanding a change to deciding what to build. Dessi reports that the internal community has grown to about 400 company members; this figure is owner-reported because public membership analytics are not available.

### AI Skills Platform

Dessi built AI Skills Platform as the practical companion to several AI News Hub articles. It turns selected research into reusable skills, agents, plugins, and tool connectors with manifests, test prompts, usability labels, installation flows, and a public catalog. The open-source project is documented separately under `project-ai-skills-framework`.

### Intent Recognition Agent

A four-layer marketing intelligence system that models consumer intention through behavioural embeddings, clustering, and LLM-powered persona generation. It represents intent as a geometric structure whose relationships and clusters can be inspected. See `project-intent-recognition` for the implementation boundary.

### Agentic Commerce Learning Loop

A governed learning-loop architecture that separates simulation, observed outcomes, belief revision, and human approval. The public collaborative project is documented separately under `project-agentic-commerce`.

### Programmatic Plugin and Agent Harness

Dessi is building the Programmatic plugin across agent skills, a typed CLI, backend tools, tenant-bound execution policy, human approval, evidence handling, and recovery. The model interprets requests and explains results, while deterministic runtime and backend controls retain authority over entitlement, tenant scope, command grammar, provider writes, and audit.

The current harness has strong execution-boundary coverage. Final narrative closure remains a known engineering gap: the system does not yet enforce a general claim-to-source transaction before text reaches the user. This distinction between a green tool harness and an evidence-faithful final answer is part of the active scaling work.

### Production Agent and Data Systems

The production request path connects an authenticated user and persistent agent session to selected skills, a typed Programmatic CLI, backend services, analytical data, and advertising-platform APIs. The system must resolve ambiguous intent across tenant and provider hierarchies without turning each new phrasing into a new command, while deterministic controls retain authority over scope, entitlements, writes, approvals, and recovery.

Dessi also builds backend ingestion and serving workflows for heterogeneous advertising data across multiple provider hierarchies and analytical grains. Storage and serving decisions are evaluated against the actual workload: dynamic query shape, aggregation, latency, reliability, and cost. Current architecture proposals are described as active design work, not as deployed outcomes.

## What This Experience Demonstrates

- End-to-end ownership across agent skills, typed tools, services, data, policy, and interfaces
- Enterprise systems engineering across tenant scope, AWS, provider integrations, and human approval
- Clear separation between model interpretation and deterministic execution authority
- Reliability work that treats evidence completeness and final-answer acceptance as distinct from tool success

## Evidence Boundary

These production responsibilities are owner-reported at architecture and responsibility level. Employer code, client data, logs, infrastructure details, operational measurements, and internal discussions are not public evidence. Independent systems such as Gateplane and Agentic Commerce make related authority, evaluation, and recovery patterns inspectable, but are not represented as employer deployments.
