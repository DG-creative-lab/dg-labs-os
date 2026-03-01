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

A personal portfolio presented as a cognitive operating system. Facts about Dessi's work, research, and ideas are represented as apps, windows, nodes, and workflows. The UI metaphor is not decorative — it _is_ the information architecture.

## Core Metaphor

- **Desktop** = current cognitive state (what is active now)
- **Apps** = stable modules of work and thinking
- **Terminal** = agent runtime and command surface (you are here)
- **Network** = knowledge graph of education, experience, research, and projects

## Architecture

### Desktop Shell

Mac-style toolbar and dock with RippleGrid animated background. Toolbar includes Apple menu and app menus. Dock provides access to all modules: Workbench, Lab Notes, Timeline, News Hub, Network, Links, Agents.

### Mobile Shell

iPhone-inspired lock/home UX for mobile visitors. Tap-to-unlock gesture, app grid, and bottom dock.

### Content Modules

- **Workbench** (`/apps/projects`): flagship systems, platforms, writing, hackathons
- **Lab Notes** (`/apps/notes`): deep-dive research threads and principles
- **Network** (`/apps/network`): Sigma.js knowledge graph with weighted nodes and idea edges
- **Terminal** (`/apps/terminal`): hybrid runtime — deterministic CLI + LLM-grounded responses
- **Resume** (`/apps/resume`): career trajectory and milestones

### Agent Runtime (Terminal)

The terminal is not just a UI gimmick. It is backed by a structured knowledge base (the system you are querying right now) and can:

- Execute deterministic commands (`help`, `open`, `search`, `projects`, `resume`)
- Route natural language to appropriate commands
- Answer open-ended questions using retrieval-grounded LLM responses
- Cite sources and provide verification paths

## Why This Matters

Most developer portfolios are lists of projects with links. DG-Labs OS reframes the portfolio as an explorable system — visitors (human or AI) can navigate, query, and verify. This is a practical implementation of the empowerment thesis: give the visitor agency over how they explore the information, rather than forcing them through a linear narrative.

## Self-Referential Note

This knowledge file is part of the system it describes. The agent answering your questions right now is drawing from this file and others like it. This is by design — the portfolio demonstrates its own capabilities by being built with them.
