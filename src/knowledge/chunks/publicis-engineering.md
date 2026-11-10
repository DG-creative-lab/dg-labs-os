---
id: 'experience-publicis-engineering'
type: 'experience'
title: 'Publicis Media Engineering'
tags: ['experience', 'past-role', 'marketing-intelligence', 'programmatic', 'publicis']
confidence: 'self-reported'
sources:
  [
    'https://www.linkedin.com/in/dessi-georgieva/',
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

# Publicis Media Engineering

**Title**: Engineer
**Period**: November 2023 to November 2026
**Location**: London, UK
**Organisation**: Publicis Media

## Role Context

The role involved taking AI and data applications from operational need and prototype into production: AgentCore runtimes, typed tools, AWS workflows, multi-tenant platform boundaries, evaluation, programmatic provider integrations, analytical data, and marketing-intelligence interfaces. The users included internal agency teams responsible for major advertiser accounts. Detailed code, traces, infrastructure, measurements, customer identities, and customer data remain employer-confidential.

## Core Systems Built

### Intent Recognition Agent

A four-layer marketing intelligence system that models consumer intention through behavioural embeddings, clustering, and LLM-powered persona generation. It represents intent as a geometric structure whose relationships and clusters can be inspected. See `project-intent-recognition` for the implementation boundary.

### Agentic Commerce Learning Loop

A governed learning-loop architecture that separates simulation, observed outcomes, belief revision, and human approval. The public collaborative project is documented separately under `project-agentic-commerce`.

### Programmatic Plugin and Agent Harness

Dessi architected the Programmatic plugin from an initial prototype into a production system used by internal agency teams across three major global advertiser accounts. It connects Claude Agent SDK on AWS Bedrock AgentCore to agent skills, a provider-neutral typed CLI, Lambda services, analytical data, and hierarchical DV360 and TTD APIs. The model interprets requests and explains results, while deterministic runtime and backend controls retain authority over entitlement, tenant scope, supported operations, provider writes, evidence, approval, and audit.

The CLI grammar is designed around domain capabilities rather than every possible user phrasing. This lets the model interpret variable intent without requiring the command surface to grow for every edge request. The tradeoff is deliberate: model reasoning remains flexible, but unsupported scope, incomplete evidence, and unsafe external effects fail closed.

At the time of the review, the harness had strong coverage of execution boundaries. Checking whether a successful tool run produced a complete, supported answer was still active architecture work.

### Evaluation and Observability

Dessi designed routing and correctness evaluations for the agent. The broader evaluation surface combines deterministic routing, parameter, ordering, schema, retrieval-grounding, latency, and cost measures with LLM judging where semantic assessment is required. AgentCore traces, CloudWatch, and PostHog support production diagnosis, while evaluation datasets and thresholds remain version-controlled and reviewable.

### Customer-Led Product Capabilities

Agency users needed campaign playbooks to remain owned and maintained by the people operating them. The original process loaded playbooks into the platform knowledge base as a one-off administrator task. Dessi translated that requirement into tenant-scoped CLI workflows through which authorised users can create, persist, version, and share playbooks as operating practice changes.

### Production Agent and Data Systems

The production request path connects an authenticated user and persistent AgentCore session to selected skills, the Programmatic CLI, Lambda services, analytical data, and advertising-platform APIs. Deployment is automated through GitHub Actions and AWS stack workflows across controlled development, staging, and production environments.

Dessi built ad-platform ingestion connectors and three Databricks ELT layers for advertising datasets that could reach millions of records. Bronze captured source data, silver normalised it, and gold prepared it for reporting. She designed a production S3 landing layer, bounded read-only staging access, and schema-based development reads against test data.

She built Databricks-backed serving APIs so AI agents could read analytical results through the typed Programmatic CLI. The CLI routed between warehouse reports and live ad-platform APIs according to data availability and policy. The data and serving work covered schema validation, freshness, completeness, and reconciliation to source totals.

Configuration-driven onboarding replaced spreadsheet exchange and removed at least three days of cross-team coordination per cycle.

Development and personal-stack testing exposed a lifecycle limit in AgentCore: each deployment created another immutable runtime version until the configured allowance was exhausted and deployments temporarily failed. The team restored delivery by increasing the allowance, then added development-runtime rotation and version-headroom checks so the environment could not silently approach the same limit again.

## What This Experience Demonstrates

- End-to-end ownership across agent skills, typed tools, services, data, policy, and interfaces
- Enterprise delivery from customer requirements and prototype through AWS deployment, evaluation, onboarding, and adoption
- Clear separation between model interpretation and deterministic execution authority
- Product judgement that converts repeated customer needs into reusable platform capabilities
- Reliability work spanning traces, evaluation, deployment headroom, recovery, and final-answer acceptance

## Evidence Boundary

These production responsibilities and sanitised outcomes are owner-reported. Employer code, customer identities and data, traces, infrastructure details, detailed measurements, and internal discussions are not public evidence. Independent systems such as Gateplane, Agentic Commerce, and DG-OS make related authority, evaluation, retrieval, and recovery patterns inspectable, but are not represented as employer deployments.
