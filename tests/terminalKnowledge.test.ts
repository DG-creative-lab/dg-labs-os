import { describe, expect, it } from 'vitest';
import { userConfig } from '../src/config';
import { dessiNetworkModule } from '../src/profiles/network';
import { workbench } from '../src/config/workbench';
import { getKnowledgeEntries } from '../src/knowledge';
import { dessiWritingModule } from '../src/profiles/writing';
import {
  buildKnowledgeIndex,
  getKnowledgeSourceStats,
  retrieveKnowledge,
} from '../src/utils/terminalKnowledge';

const ctx = {
  user: userConfig,
  workbench,
  writing: dessiWritingModule.entries,
  network: dessiNetworkModule.nodes,
  brain: getKnowledgeEntries(),
};

describe('terminalKnowledge', () => {
  it('builds index from all configured sources', () => {
    const stats = getKnowledgeSourceStats(ctx);
    const index = buildKnowledgeIndex(ctx);
    expect(index.length).toBe(
      stats.personal + stats.workbench + stats.writing + stats.network + stats.brain
    );
    expect(index.some((item) => item.source === 'personal')).toBe(true);
    expect(index.some((item) => item.source === 'brain')).toBe(true);
  });

  it('returns source stats', () => {
    const stats = getKnowledgeSourceStats(ctx);
    expect(stats.personal).toBe(1);
    expect(stats.workbench).toBe(workbench.length);
    expect(stats.writing).toBe(dessiWritingModule.entries.length);
    expect(stats.network).toBe(dessiNetworkModule.nodes.length);
    expect(stats.brain).toBeGreaterThan(0);
  });

  it('retrieves ranked hits for a query', () => {
    const hits = retrieveKnowledge('intent modeling', ctx, 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].score).toBeGreaterThan(0);
  });

  it('retrieves the founder platform and its bounded product roles', () => {
    const hits = retrieveKnowledge('owner controlled evidence learning network founder', ctx, 20);
    const platform = getKnowledgeEntries().find(
      (entry) => entry.id === 'project-human-systems-platform'
    );

    expect(platform?.content).toContain('owner-approved evidence');
    expect(platform?.content).toContain('Organization Foundry');
    expect(platform?.content).toContain('commercial validation remain incomplete');
    expect(hits.some((hit) => hit.id === 'brain-project-human-systems-platform')).toBe(true);
  });

  it('preserves inline and multiline frontmatter provenance metadata', () => {
    const entries = getKnowledgeEntries();
    const architecture = entries.find((entry) => entry.id === 'capability-agent-architecture');
    const skills = entries.find((entry) => entry.id === 'project-ai-skills-framework');

    expect(entries).toHaveLength(20);
    expect(architecture).toMatchObject({
      tags: ['capability', 'agents', 'orchestration', 'bayesian', 'multi-agent', 'architecture'],
      sources: ['https://github.com/DG-creative-lab', 'https://github.com/ai-knowledge-hub'],
      related: [
        'project-intent-recognition',
        'project-agentic-commerce',
        'project-ai-skills-framework',
        'research-themes',
      ],
    });
    expect(skills).toMatchObject({
      tags: [
        'project',
        'open-source',
        'skills',
        'agents',
        'plugins',
        'tools',
        'go',
        'nextjs',
        'agent-operations',
      ],
      sources: [
        'https://skills.ai-knowledge-hub.org/',
        'https://github.com/ai-knowledge-hub/ai-skills-guide',
        'https://ai-news-hub.performics-labs.com/news/agent-architect-playbook-building-ai-skills-marketing-adtech',
      ],
      related: [
        'project-ai-news-hub',
        'capability-agent-architecture',
        'capability-technical-stack',
        'research-themes',
      ],
    });
    expect(entries.every((entry) => entry.tags.length > 0)).toBe(true);
    expect(entries.every((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.lastVerified))).toBe(true);
  });
});
