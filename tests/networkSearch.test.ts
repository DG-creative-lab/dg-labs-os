import { describe, expect, it } from 'vitest';
import { filterNetworkNodes } from '../src/utils/networkSearch';
import { networkNodes } from '../src/config/network';

describe('filterNetworkNodes', () => {
  it('returns all nodes with ALL filter and empty query', () => {
    const res = filterNetworkNodes(networkNodes, 'ALL', '');
    expect(res.length).toBe(networkNodes.length);
  });

  it('filters by kind', () => {
    const res = filterNetworkNodes(networkNodes, 'Org', '');
    expect(res.every((n) => n.kind === 'Org')).toBe(true);
  });

  it('filters by query across tags/title/subtitle/bullets', () => {
    const res = filterNetworkNodes(networkNodes, 'ALL', 'empowerment');
    expect(res.length).toBeGreaterThan(0);
    expect(res.some((n) => n.id === 'research-empowerment-imperative')).toBe(true);
  });
});
