import { describe, expect, it } from 'vitest';
import { buildGraph } from '../src/utils/networkGraph';
import { networkNodes } from '../src/config/network';

describe('buildGraph', () => {
  it('places artifact/project/org nodes into graph lanes', () => {
    const { graphNodes } = buildGraph(networkNodes);
    const kinds = new Set(graphNodes.map((n) => n.kind));
    expect(kinds.has('Artifact')).toBe(true);
    expect(kinds.has('Project')).toBe(true);
    expect(kinds.has('Org')).toBe(true);
  });

  it('creates only valid edges between existing nodes', () => {
    const { graphNodes, edges } = buildGraph(networkNodes);
    const ids = new Set(graphNodes.map((n) => n.id));
    expect(edges.length).toBeGreaterThan(0);
    for (const edge of edges) {
      expect(ids.has(edge.from.id)).toBe(true);
      expect(ids.has(edge.to.id)).toBe(true);
    }
  });
});
