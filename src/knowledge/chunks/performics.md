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
last_verified: '2026-09-21'
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

The role involves taking AI and data applications from operational need and prototype into production: AgentCore runtimes, typed tools, AWS workflows, multi-tenant platform boundaries, evaluation, programmatic provider integrations, analytical data, and marketing-intelligence interfaces. The users include internal agency teams responsible for major advertiser accounts. Detailed code, traces, infrastructure, measurements, customer identities, and customer data remain employer-confidential.

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

Dessi architected the Programmatic plugin from an initial prototype into a production system used by internal agency teams across three major global advertiser accounts. It connects Claude Agent SDK on AWS Bedrock AgentCore to agent skills, a provider-neutral typed CLI, Lambda services, analytical data, and hierarchical DV360 and TTD APIs. The model interprets requests and explains results, while deterministic runtime and backend controls retain authority over entitlement, tenant scope, supported operations, provider writes, evidence, approval, and audit.

The CLI grammar is designed around domain capabilities rather than every possible user phrasing. This lets the model interpret variable intent without requiring the command surface to grow for every edge request. The tradeoff is deliberate: model reasoning remains flexible, but unsupported scope, incomplete evidence, and unsafe external effects fail closed.

The current harness has strong execution-boundary coverage. Final narrative closure remains active architecture work: successful tool execution is not treated as proof that the final answer is complete and supported.

### Evaluation and Observability

Dessi designed routing and correctness evaluations for the agent. The broader evaluation surface combines deterministic routing, parameter, ordering, schema, retrieval-grounding, latency, and cost measures with LLM judging where semantic assessment is required. AgentCore traces, CloudWatch, and PostHog support production diagnosis, while evaluation datasets and thresholds remain version-controlled and reviewable.

### Customer-Led Product Capabilities

Agency users needed campaign playbooks to remain owned and maintained by the people operating them. The original process loaded playbooks into the platform knowledge base as a one-off administrator task. Dessi translated that requirement into tenant-scoped CLI workflows through which authorised users can create, persist, version, and share playbooks as operating practice changes.

### Production Agent and Data Systems

The production request path connects an authenticated user and persistent AgentCore session to selected skills, the Programmatic CLI, Lambda services, analytical data, and advertising-platform APIs. Deployment is automated through GitHub Actions and AWS stack workflows across controlled development, staging, and production environments.

Dessi also builds backend ingestion and serving workflows for advertising datasets that can reach millions of records across multiple provider hierarchies and analytical grains. Configuration-driven onboarding replaces spreadsheet exchange and at least three days of cross-team enablement coordination with validated provisioning, reconciliation, and auditable state.

Development and personal-stack testing exposed a lifecycle limit in AgentCore: each deployment created another immutable runtime version until the configured allowance was exhausted and deployments temporarily failed. The team restored delivery by increasing the allowance, then added development-runtime rotation and version-headroom checks so the environment could not silently approach the same limit again.

## What This Experience Demonstrates

- End-to-end ownership across agent skills, typed tools, services, data, policy, and interfaces
- Enterprise delivery from customer requirements and prototype through AWS deployment, evaluation, onboarding, and adoption
- Clear separation between model interpretation and deterministic execution authority
- Product judgement that converts repeated customer needs into reusable platform capabilities
- Reliability work spanning traces, evaluation, deployment headroom, recovery, and final-answer acceptance

## Evidence Boundary

These production responsibilities and sanitised outcomes are owner-reported. Employer code, customer identities and data, traces, infrastructure details, detailed measurements, and internal discussions are not public evidence. Independent systems such as Gateplane, Agentic Commerce, and DG-OS make related authority, evaluation, retrieval, and recovery patterns inspectable, but are not represented as employer deployments.
