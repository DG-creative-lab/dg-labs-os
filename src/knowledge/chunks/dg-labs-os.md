---
id: 'project-dg-labs-os'
type: 'project'
title: 'DG-Labs OS — Portfolio as Operating System'
tags: ['project', 'portfolio', 'os-metaphor', 'astro', 'react', 'agent', 'terminal']
confidence: 'verified'
sources: ['https://github.com/DG-creative-lab']
last_verified: '2025-06-01'
related:
  ['identity-profile', 'identity-philosophy', 'capability-technical-stack', 'meta-how-to-query']
---

# DG-Labs OS — Portfolio as Operating System

**Classification**: Portfolio / meta-system
**Status**: Active development
**Built with**: Astro + React hybrid

## What It Is

A personal portfolio presented as a cognitive operating system. Facts about Dessi's systems, professional writing, and evolving ideas are represented as apps, windows, nodes, and workflows. The UI metaphor is not decorative — it _is_ the information architecture.

## Core Metaphor

- **Desktop** = current cognitive state (what is active now)
- **Apps** = stable modules of work and thinking
- **Terminal** = agent runtime and command surface (you are here)
- **System Map** = curated relationships between career experience, engineering practices, systems, and evidence

## Architecture

### Desktop Shell

Mac-style toolbar and dock with RippleGrid animated background. Toolbar includes Apple menu and app menus. Dock provides access to the public modules: Workbench, Technical Writing, Evidence & Evolution, Resume, System Map, Links, and Agents.

The root desktop opens a browser window containing the **Creative Machine Monitor**: an interactive model of the constructive loop behind DG-OS. Its Understand, Imagine, and Build modes show how projects, readings, questions, decisions, and failures become traceable patterns that can be revisited and recombined. Each public module is a different projection of this evolving material rather than an isolated portfolio page.

The monitor takes a conceptual cue from Greg Egan's _Permutation City_: persistence through pattern is used as a design metaphor for a computational creative practice. DG-OS does not claim to implement the novel's Dust Theory, simulate consciousness, or replace Dessi's authorship. Sources remain bounded, public memory is reviewed, and human control is explicit. Visitors can close the browser to reveal the animated desktop and reopen it from the Browser icon in the dock.

### Mobile Shell

iPhone-inspired lock/home UX for mobile visitors. Tap-to-unlock gesture, app grid, and bottom dock.

### Content Modules

- **Workbench** (`/apps/projects`): selected public-code and deployed personal systems plus bounded professional platform context
- **Technical Writing** (`/apps/notes`): selected Performics Labs analysis with explicit provenance, related systems, and limitations
- **Evidence & Evolution** (`/apps/evolution`): reviewed public entries showing how ideas, systems, questions, and interpretations change over time
- **Systems & Evidence** (`/systems`): a public dossier separating Dessi's contribution, evaluation, result, and limitation across selected systems
- **System Map** (`/apps/network`): React Flow projection of a curated Graphology model with typed, evidence-bearing relationships and guided paths
- **Terminal** (`/apps/terminal`): hybrid runtime — deterministic CLI + LLM-grounded responses
- **Resume** (`/apps/resume`): career trajectory and milestones

### Agent Runtime (Terminal)

The terminal is not just a UI gimmick. It is backed by a structured knowledge base (the system you are querying right now) and can:

- Execute deterministic commands (`help`, `open`, `search`, `projects`, `resume`)
- Route natural language to appropriate commands
- Answer open-ended questions using retrieval-grounded LLM responses
- Cite sources and provide verification paths

## Why This Matters

Most developer portfolios are lists of projects with links. DG-Labs OS reframes the portfolio as an explorable system: visitors can navigate, query, compare, and verify work without being forced through a single linear narrative.

## Self-Referential Note

This knowledge file is part of the system it describes. The agent answering your questions right now is drawing from this file and others like it. This is by design — the portfolio demonstrates its own capabilities by being built with them.
