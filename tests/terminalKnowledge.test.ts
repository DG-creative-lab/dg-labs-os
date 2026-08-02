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
});
