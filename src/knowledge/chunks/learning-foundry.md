---
id: 'project-learning-foundry'
type: 'project'
title: 'Learning Foundry'
tags: ['learning', 'human-agent', 'evidence', 'capabilities', 'codex', 'evaluation']
confidence: 'verified'
sources:
  [
    'https://github.com/DG-creative-lab/codex-hack-learning-foundry/tree/0547da02518f432fdd85e79d317e1fedaa51c4c1',
  ]
last_verified: '2026-08-23'
related: ['project-human-systems-platform', 'project-dg-labs-os', 'identity-philosophy']
---

# Learning Foundry

Learning Foundry is a learning product for people who work with AI agents. It helps someone turn approved sources and practical work into understanding they can explain, test, apply, and revise.

A polished answer cannot show whether the person understood the problem or whether the agent supplied the capability. Learning Foundry records those paths separately. Human explanation, prediction, practice, and transfer belong to the human learning record. Agent memory, evaluation, approval, and activation belong to the agent capability record.

## What the Product Does

- Preserves original sources while allowing interpretations and explanations to change.
- Creates grounded explanations, checks, predictions, practice, and bounded interactive exercises.
- Records practical application, feedback, failure, and correction.
- Develops versioned agent capabilities that require evaluation and human approval before activation.
- Keeps missing evidence visible instead of translating it into a score or a claim of incapability.

Learning Foundry is useful on its own as a place to develop human and agent capability. Within Human Systems Platform, it contributes curated learning and capability evidence while its private ledger remains inside its own boundary.

## Current State

The linked public commit preserves the OpenAI Build Week submission. It demonstrates the evidence ledger, deterministic projections, learning checks, a capability lifecycle, and a consent-gated Codex adapter in one bounded domain.

The prototype does not establish longitudinal learning outcomes or broad capability transfer. Private persistence, wider real-world use, and full integration with Human Systems Platform remain under development.
