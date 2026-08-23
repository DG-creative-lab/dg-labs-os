---
id: 'project-ai-skills-framework'
type: 'project'
title: 'AI Skills Platform'
tags:
  [
    'project',
    'open-source',
    'skills',
    'agents',
    'plugins',
    'tools',
    'go',
    'nextjs',
    'agent-operations',
  ]
confidence: 'verified'
sources:
  [
    'https://skills.ai-knowledge-hub.org/',
    'https://github.com/ai-knowledge-hub/ai-skills-guide',
    'https://ai-news-hub.performics-labs.com/news/agent-architect-playbook-building-ai-skills-marketing-adtech',
  ]
last_verified: '2026-08-23'
related:
  [
    'project-ai-news-hub',
    'capability-agent-architecture',
    'capability-technical-stack',
    'research-themes',
  ]
---

# AI Skills Platform

**Classification**: Open-source public catalog and installation platform

**Status**: Active and public

**Site**: https://skills.ai-knowledge-hub.org/

**Repository**: https://github.com/ai-knowledge-hub/ai-skills-guide

## The Product

AI Skills Platform turns applied AI research into reusable working capabilities. Articles can explain how an agent workflow should operate. Practitioners still need packages they can inspect, install, test, and adapt. This platform supplies that practical layer.

Dessi developed it as a companion to several AI News Hub articles. The catalog began with marketing and adtech, then expanded into engineering maintenance, security, and agent operations.

## What It Publishes

The public catalog has four installable module types:

- skills encode task-level expertise and operating instructions
- agents coordinate roles, skills, tools, outputs, and approval boundaries
- plugins bundle related capabilities into installable compositions
- tools and MCP entries describe integrations, authentication, access, and trust boundaries

Documentation-only packs combine existing entries into practical playbooks without presenting themselves as installable runtime modules.

At the reviewed state, generated registries contain 42 skills, seven agents, eight tool or MCP entries, and 11 plugins. The repository also contains 69 test-prompt suites.

## How It Is Built

Each package follows a repeatable structure with a specification, manifest, examples, test prompts, dependencies, and runtime assumptions. Generated registries drive both the command-line installer and the public Next.js catalog.

Usability metadata tells users whether an entry works immediately, needs setup, is a template, or is documentation only. Operational metadata also identifies connected systems, authentication, access level, permissions, trust boundaries, and approval requirements where relevant.

The installer supports Codex, Claude, and generic runtime targets. Go provides the registry and installation tooling, while Next.js and TypeScript provide the public browsing interface.

## Product Role

The AI News Hub helps people understand a change. AI Skills Platform helps them try a governed implementation of it. Together they connect research, practical learning, reusable capability design, and public code.

## Boundaries

The public site and repository verify the catalog, packages, tooling, and declared usability. Registry inclusion does not prove adoption or production impact. Some entries require credentials or configuration, and template-only entries still require implementation before they can operate against real systems.
