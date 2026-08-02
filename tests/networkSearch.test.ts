import { describe, expect, it } from 'vitest';
import { filterNetworkNodes } from '../src/utils/networkSearch';
import { dessiNetworkModule } from '../src/profiles/network';

const networkNodes = dessiNetworkModule.nodes;

describe('filterNetworkNodes', () => {
  it('returns all nodes with ALL filter and empty query', () => {
    const res = filterNetworkNodes(networkNodes, 'ALL', '');
    expect(res.length).toBe(networkNodes.length);
  });

  it('filters by kind', () => {
    const res = filterNetworkNodes(networkNodes, 'System', '');
    expect(res.every((n) => n.kind === 'System')).toBe(true);
  });

  it('filters by query across tags/title/subtitle/bullets', () => {
    const res = filterNetworkNodes(networkNodes, 'ALL', 'evaluation');
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((n) => n.id === 'practice-evaluation-evidence')).toBe(true);
  });
});
