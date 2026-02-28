import type { NetworkIdeaEdge, NetworkKind, NetworkNode } from '../config/network';

export type GraphNode = NetworkNode & {
  x: number;
  y: number;
  r: number;
};

export type GraphEdge = {
  from: GraphNode;
  to: GraphNode;
  idea: string;
  strength: 1 | 2 | 3 | 4 | 5;
  style: 'solid' | 'dotted';
};

const laneOrder: readonly NetworkKind[] = [
  'Education',
  'Research',
  'Project',
  'Event',
  'Experience',
  'Org',
];

const laneLabel: Record<NetworkKind, string> = {
  Education: 'Education',
  Research: 'Research',
  Project: 'Projects',
  Event: 'Hackathons',
  Experience: 'Experience and Tools',
  Org: 'Companies',
};

export const buildGraph = (
  nodes: readonly NetworkNode[],
  ideas: readonly NetworkIdeaEdge[] = []
) => {
  const colGap = 190;
  const startX = 110;
  const rowGap = 84;
  const top = 90;
  const width = Math.max(840, startX + colGap * laneOrder.length);

  const nodesByLane = new Map<NetworkKind, NetworkNode[]>();
  laneOrder.forEach((k) =>
    nodesByLane.set(
      k,
      nodes.filter((n) => n.kind === k)
    )
  );

  const laneX = new Map<NetworkKind, number>(
    laneOrder.map((kind, index) => [kind, startX + index * colGap])
  );

  const graphNodes: GraphNode[] = laneOrder.flatMap((kind) => {
    const x = laneX.get(kind) ?? startX;
    const laneNodes = nodesByLane.get(kind) ?? [];
    return laneNodes.map((node, i) => ({
      ...node,
      x,
      y: top + i * rowGap,
      r: 7 + node.weight * 2.2,
    }));
  });

  const byId = new Map(graphNodes.map((n) => [n.id, n]));
  const maxY = graphNodes.length > 0 ? Math.max(...graphNodes.map((n) => n.y)) : 0;
  const height = Math.max(430, Math.round(maxY + 120));

  let edges: GraphEdge[] = ideas
    .map((edge) => {
      const from = byId.get(edge.from);
      const to = byId.get(edge.to);
      if (!from || !to) return null;
      return {
        from,
        to,
        idea: edge.idea,
        strength: edge.strength ?? 2,
        style: edge.style ?? 'solid',
      } satisfies GraphEdge;
    })
    .filter((edge): edge is GraphEdge => Boolean(edge));

  if (edges.length === 0) {
    const ordered = graphNodes.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    const fallback: GraphEdge[] = [];
    for (let i = 0; i < ordered.length - 1; i += 1) {
      fallback.push({
        from: ordered[i],
        to: ordered[i + 1],
        idea: 'trajectory',
        strength: 1,
        style: 'solid',
      });
    }
    edges = fallback;
  }

  const lanes = laneOrder.map((kind) => ({
    kind,
    label: laneLabel[kind],
    x: laneX.get(kind) ?? startX,
  }));

  return { graphNodes, edges, lanes, width, height };
};
