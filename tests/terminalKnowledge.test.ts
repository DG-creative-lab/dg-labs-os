import { describe, expect, it } from 'vitest';
import { userConfig } from '../src/config';
import { labNotes } from '../src/config/labNotes';
import { networkNodes } from '../src/config/network';
import { workbench } from '../src/config/workbench';
import {
  buildKnowledgeIndex,
  getKnowledgeSourceStats,
  retrieveKnowledge,
} from '../src/utils/terminalKnowledge';

const ctx = {
  user: userConfig,
  workbench,
  notes: labNotes,
  network: networkNodes,
};

describe('terminalKnowledge', () => {
  it('builds index from all configured sources', () => {
    const index = buildKnowledgeIndex(ctx);
    expect(index.length).toBe(1 + workbench.length + labNotes.length + networkNodes.length);
    expect(index.some((item) => item.source === 'personal')).toBe(true);
  });

  it('returns source stats', () => {
    const stats = getKnowledgeSourceStats(ctx);
    expect(stats.personal).toBe(1);
    expect(stats.workbench).toBe(workbench.length);
    expect(stats.notes).toBe(labNotes.length);
    expect(stats.network).toBe(networkNodes.length);
  });

  it('retrieves ranked hits for a query', () => {
    const hits = retrieveKnowledge('intent modeling', ctx, 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].score).toBeGreaterThan(0);
  });
});
