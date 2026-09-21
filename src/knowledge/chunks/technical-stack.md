---
id: 'capability-technical-stack'
type: 'capability'
title: 'AI Systems and Harness Capabilities'
tags: ['capability', 'agent-harness', 'system-architecture', 'evaluation', 'authority', 'recovery']
confidence: 'verified'
sources: ['https://github.com/DG-creative-lab', 'https://github.com/ai-knowledge-hub']
last_verified: '2026-09-21'
related:
  [
    'identity-profile',
    'experience-performics',
    'capability-agent-architecture',
    'capability-ai-coding-workflow',
  ]
---

# AI Systems and Harness Capabilities

Dessi's technical capability is best understood through the environments she designs around AI models. A harness is the combination of context, memory, tools, rules, state, evaluation, and human interaction that turns model capability into a useful system.

## Operating Environment Design

- Defines the people, agents, tools, data, policies, and surrounding systems that must work together to create a useful outcome.
- Makes product goals, domain knowledge, interfaces, and operational signals legible to both agents and people.
- Treats the whole system as the unit of design, including the effects it creates in other systems.

## Forward-Deployed Delivery

- Works with internal agency teams and consulting clients to turn operational needs into testable prototypes and production capabilities.
- Integrates Claude Agent SDK on AWS Bedrock AgentCore with Lambda services, provider APIs, analytical data, tenant policy, and user-facing workflows.
- Converts repeated requirements into reusable capabilities rather than one-off customer branches, including automated onboarding and user-owned, versioned playbooks.

## Context and Capability Design

- Assembles task-relevant context with clear sources, freshness, scope, and privacy boundaries.
- Turns repeated procedures into reusable skills, tool contracts, and execution paths.
- Separates working context, durable memory, approved evidence, and public claims.

## Authority and Human Attention

- Keeps identity, permissions, approvals, evidence, state transitions, and consequential effects outside model authority.
- Defines when an agent can continue, when it should ask for clarification, and when a person must approve the next step.
- Designs interfaces that help people review uncertainty, evidence, risk, and proposed action without monitoring every model step.

## Evaluation, Learning, and Recovery

- Tests model behaviour, tool use, component interactions, and whole-system outcomes.
- Turns failures, feedback, and observed outcomes into changes that remain reviewable and reversible.
- Uses explicit execution state, traces, receipts, budgets, retries, replay, fallback, cancellation, and rollback to make work observable and recoverable.
- Designs routing and correctness evaluations and works with AgentCore traces, CloudWatch, PostHog, latency, cost, grounding, and tool-use signals.
- Treats deployment lifecycle limits as system constraints, with headroom checks and runtime rotation where immutable AgentCore versions accumulate.

## Implementation Evidence

Production employer work provides experience with authenticated multi-tenant workflows, customer-led product iteration, hierarchical provider APIs, automated deployment, evaluation, ingestion pipelines, analytical serving, and the operational consequences of incomplete agent answers. Those responsibilities are described at a confidentiality-safe level rather than supported by public code, customer data, or private traces.

The independent systems use different languages, frameworks, data stores, and cloud services because those are implementation choices, not the capability being claimed. They provide inspectable evidence that Dessi can direct AI coding agents, review the resulting system, enforce architectural boundaries, and verify behaviour across product, data, infrastructure, and interface layers. They complement the production record; they do not substitute for or claim employer deployment.
