import { describe, expect, it } from 'vitest';
import { buildGraph } from '../src/utils/networkGraph';
import { networkIdeaEdges, networkNodes } from '../src/config/network';

describe('buildGraph', () => {
  it('places core kinds into graph lanes', () => {
    const { graphNodes } = buildGraph(networkNodes, networkIdeaEdges);
    const kinds = new Set(graphNodes.map((n) => n.kind));
    expect(kinds.has('Education')).toBe(true);
    expect(kinds.has('Research')).toBe(true);
    expect(kinds.has('Project')).toBe(true);
    expect(kinds.has('Experience')).toBe(true);
  });

  it('creates only valid edges between existing nodes', () => {
    const { graphNodes, edges } = buildGraph(networkNodes, networkIdeaEdges);
    const ids = new Set(graphNodes.map((n) => n.id));
    expect(edges.length).toBeGreaterThan(0);
    for (const edge of edges) {
      expect(ids.has(edge.from.id)).toBe(true);
      expect(ids.has(edge.to.id)).toBe(true);
    }
  });
});
