---
id: 'project-ai-skills-framework'
type: 'project'
title: 'AI Knowledge Hub Skills'
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
    'https://ai-knowledge-hub.org/library/agent-architect-playbook-building-ai-skills-marketing-adtech/',
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

# AI Knowledge Hub Skills

**Classification**: Open-source public catalog and installation platform

**Status**: Active and public

**Site**: https://skills.ai-knowledge-hub.org/

**Repository**: https://github.com/ai-knowledge-hub/ai-skills-guide

## The Product

AI Knowledge Hub Skills turns applied AI research into reusable working capabilities. Articles can explain how an agent workflow should operate. Practitioners still need packages they can inspect, install, test, and adapt. This platform supplies that practical layer.

Dessi developed Skills as a practical companion to the research and writing now published at AI Knowledge Hub. The catalogue began with marketing and adtech, then expanded into engineering maintenance, security, and agent operations.

## What It Publishes

The public catalogue has four types of resources:

- skills encode task-level expertise and operating instructions
- agents coordinate roles, skills, tools, outputs, and approval boundaries
- plugins describe reusable compositions, with installability declared per entry
- tools and MCP entries describe integrations, authentication, access, and trust boundaries

Documentation-only packs combine existing entries into practical playbooks without presenting themselves as installable runtime modules.

At the reviewed state, generated registries contain 42 skills, seven agents, eight tool or MCP entries, and 11 plugins. The repository also contains 69 test-prompt suites.

## How It Is Built

Each package follows a repeatable structure with a specification, manifest, examples, test prompts, dependencies, and runtime assumptions. Generated registries drive both the command-line installer and the public Next.js catalog.

Usability metadata tells users whether an entry works immediately, needs setup, is a template, or is documentation only. Operational metadata also identifies connected systems, authentication, access level, permissions, trust boundaries, and approval requirements where relevant.

The installer supports Codex, Claude, and generic runtime targets. Go provides the registry and installation tooling, while Next.js and TypeScript provide the public browsing interface.

## Product Role

AI Knowledge Hub publishes research and essays. Skills provides reusable resources and Harness explains the underlying system design through guides and interactive examples.

## Boundaries

The public site and repository verify the catalog, packages, tooling, and declared usability. Registry inclusion does not prove adoption or production impact. Some entries require credentials or configuration, and template-only entries still require implementation before they can operate against real systems.
