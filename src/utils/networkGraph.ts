import type { NetworkNode } from '../config/network';

export type GraphNode = NetworkNode & {
  x: number;
  y: number;
};

export type GraphEdge = {
  from: GraphNode;
  to: GraphNode;
};

export const buildGraph = (nodes: readonly NetworkNode[]) => {
  const writing = nodes.filter((n) => n.kind === 'Artifact');
  const systems = nodes.filter((n) => n.kind === 'Project');
  const platforms = nodes.filter((n) => n.kind === 'Org');

  const colX = { writing: 90, systems: 390, platforms: 690 };
  const rowGap = 76;
  const top = 70;

  const place = (items: readonly NetworkNode[], x: number): GraphNode[] =>
    items.map((n, i) => ({ ...n, x, y: top + i * rowGap }));

  const graphNodes: GraphNode[] = [
    ...place(writing, colX.writing),
    ...place(systems, colX.systems),
    ...place(platforms, colX.platforms),
  ];

  const byId = new Map(graphNodes.map((n) => [n.id, n]));

  // Edges by tag intersection with a simple cap to avoid hairballs.
  const tagSet = (n: NetworkNode) => new Set(n.tags.map((t) => t.toLowerCase()));
  const intersectCount = (a: Set<string>, b: Set<string>) => {
    let c = 0;
    for (const x of a) if (b.has(x)) c++;
    return c;
  };

  const edges: GraphEdge[] = [];

  const mkEdges = (froms: readonly NetworkNode[], tos: readonly NetworkNode[], perFrom: number) => {
    for (const f of froms) {
      const fs = tagSet(f);
      const scored = tos
        .map((t) => ({ t, s: intersectCount(fs, tagSet(t)) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, perFrom);

      // Fallback: if no tag overlap exists, still connect to the first target
      // so graph mode remains navigable and semantically structured.
      const chosen = scored.length > 0 ? scored.map((x) => x.t) : tos.slice(0, 1);

      for (const t of chosen) {
        const from = byId.get(f.id);
        const to = byId.get(t.id);
        if (from && to) edges.push({ from, to });
      }
    }
  };

  mkEdges(writing, systems, 2);
  mkEdges(systems, platforms, 2);

  return { graphNodes, edges };
};
