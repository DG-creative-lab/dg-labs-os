import { useEffect, useMemo, useRef, useState } from 'react';
import Graph from 'graphology';
import type { GraphEdge, GraphNode } from '../../utils/networkGraph';

type Lane = {
  kind: string;
  label: string;
  x: number;
};

type Props = {
  nodes: readonly GraphNode[];
  edges: readonly GraphEdge[];
  lanes: readonly Lane[];
  height: number;
  onNodeClick?: (id: string) => void;
};

const kindColor: Record<string, string> = {
  Education: '#93c5fd',
  Research: '#60a5fa',
  Project: '#22d3ee',
  Org: '#34d399',
  Event: '#c084fc',
  Experience: '#a3a3a3',
};

export default function SigmaGraph({ nodes, edges, lanes, height, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const neighborsRef = useRef<Set<string>>(new Set());
  const edgeFocusRef = useRef<Set<string>>(new Set());
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const edge of edges) {
      ids.add(edge.from.id);
      ids.add(edge.to.id);
    }
    return ids;
  }, [edges]);
  const connectedNodes = useMemo(
    () => nodes.filter((node) => connectedNodeIds.has(node.id)),
    [nodes, connectedNodeIds]
  );
  const connectedEdges = useMemo(
    () =>
      edges.filter(
        (edge) => connectedNodeIds.has(edge.from.id) && connectedNodeIds.has(edge.to.id)
      ),
    [edges, connectedNodeIds]
  );

  const laneNames = useMemo(() => lanes.map((lane) => lane.label), [lanes]);
  const nodeById = useMemo(() => new Map(connectedNodes.map((n) => [n.id, n])), [connectedNodes]);
  const majorNodeIds = useMemo(
    () => new Set(connectedNodes.filter((n) => n.weight >= 4).map((n) => n.id)),
    [connectedNodes]
  );

  useEffect(() => {
    if (!containerRef.current || connectedNodes.length === 0) return;
    if (typeof window === 'undefined') return;

    let disposed = false;
    let sigmaInstance: { kill: () => void } | null = null;

    const mount = async () => {
      const { default: Sigma } = await import('sigma');
      const forceAtlas2Module = await import('graphology-layout-forceatlas2');
      const forceAtlas2 = forceAtlas2Module.default;
      if (disposed || !containerRef.current) return;

      const container = containerRef.current;
      const graph = new Graph({ multi: true, allowSelfLoops: false });
      const laneIndexByKind = new Map(lanes.map((lane, idx) => [lane.kind, idx]));
      const laneCount = Math.max(1, lanes.length);

      const seededNoise = (seed: string) => {
        let h = 0;
        for (let i = 0; i < seed.length; i += 1) h = Math.imul(31, h) + seed.charCodeAt(i);
        const x = Math.sin(h) * 10000;
        return x - Math.floor(x);
      };

      for (const node of connectedNodes) {
        const laneIndex = laneIndexByKind.get(node.kind) ?? 0;
        const baseAngle = (laneIndex / laneCount) * Math.PI * 2;
        const angle = baseAngle + (seededNoise(`${node.id}-a`) - 0.5) * 0.7;
        const radius = 7 + seededNoise(`${node.id}-r`) * 2.2;
        graph.addNode(node.id, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          size: Math.max(4, node.r * 0.65),
          label: node.title,
          color: kindColor[node.kind] ?? '#93c5fd',
        });
      }

      for (const [index, edge] of connectedEdges.entries()) {
        if (!graph.hasNode(edge.from.id) || !graph.hasNode(edge.to.id)) continue;
        graph.addEdgeWithKey(`edge-${index}`, edge.from.id, edge.to.id, {
          color: 'rgba(148,163,184,0.6)',
          size: 1 + edge.strength * 0.6,
          label: edge.idea,
        });
      }

      if (graph.order > 1) {
        const inferred = forceAtlas2.inferSettings(graph);
        forceAtlas2.assign(graph, {
          iterations: 260,
          settings: {
            ...inferred,
            gravity: 0.3,
            scalingRatio: 9,
            strongGravityMode: false,
            barnesHutOptimize: true,
            barnesHutTheta: 0.8,
            slowDown: 1 + Math.max(1, graph.order / 120),
          },
        });
      }

      const drawPillLabel = (
        context: CanvasRenderingContext2D,
        data: { x: number; y: number; size: number; label: string | null },
        settings: { labelFont: string; labelSize: number; labelWeight: string }
      ) => {
        const text = data.label;
        if (!text) return;

        const fontSize = settings.labelSize;
        const x = data.x + data.size + 10;
        const y = data.y + fontSize * 0.35;
        const padX = 6;
        const padY = 4;
        const radius = 5;

        context.font = `${settings.labelWeight} ${fontSize}px ${settings.labelFont}`;
        const textWidth = context.measureText(text).width;
        const w = textWidth + padX * 2;
        const h = fontSize + padY * 2;
        const bx = x - padX;
        const by = y - fontSize - padY;

        context.beginPath();
        context.moveTo(bx + radius, by);
        context.arcTo(bx + w, by, bx + w, by + h, radius);
        context.arcTo(bx + w, by + h, bx, by + h, radius);
        context.arcTo(bx, by + h, bx, by, radius);
        context.arcTo(bx, by, bx + w, by, radius);
        context.closePath();
        context.fillStyle = 'rgba(2, 6, 23, 0.9)';
        context.fill();
        context.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        context.lineWidth = 1;
        context.stroke();

        context.fillStyle = 'rgba(248, 250, 252, 0.96)';
        context.fillText(text, x, y);
      };

      const drawDarkNodeHover = (
        context: CanvasRenderingContext2D,
        data: { x: number; y: number; size: number; label: string | null; color: string },
        settings: { labelFont: string; labelSize: number; labelWeight: string }
      ) => {
        const text = data.label;
        const x = data.x;
        const y = data.y;
        const size = data.size;

        // Node halo + node core
        context.beginPath();
        context.arc(x, y, size + 3.5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255,255,255,0.14)';
        context.fill();
        context.beginPath();
        context.arc(x, y, size + 0.6, 0, Math.PI * 2);
        context.fillStyle = data.color;
        context.fill();
        context.strokeStyle = 'rgba(248,250,252,0.95)';
        context.lineWidth = 2;
        context.stroke();

        if (!text) return;

        const fontSize = settings.labelSize;
        const tx = x + size + 10;
        const ty = y + fontSize * 0.35;
        const padX = 6;
        const padY = 4;
        const radius = 5;

        context.font = `${settings.labelWeight} ${fontSize}px ${settings.labelFont}`;
        const textWidth = context.measureText(text).width;
        const w = textWidth + padX * 2;
        const h = fontSize + padY * 2;
        const bx = tx - padX;
        const by = ty - fontSize - padY;

        context.beginPath();
        context.moveTo(bx + radius, by);
        context.arcTo(bx + w, by, bx + w, by + h, radius);
        context.arcTo(bx + w, by + h, bx, by + h, radius);
        context.arcTo(bx, by + h, bx, by, radius);
        context.arcTo(bx, by, bx + w, by, radius);
        context.closePath();
        context.fillStyle = 'rgba(2, 6, 23, 0.94)';
        context.fill();
        context.strokeStyle = 'rgba(255,255,255,0.22)';
        context.lineWidth = 1;
        context.stroke();

        context.fillStyle = 'rgba(248, 250, 252, 0.98)';
        context.fillText(text, tx, ty);
      };

      const sigma = new Sigma(graph, container, {
        renderLabels: true,
        labelSize: 11,
        labelDensity: 0.028,
        labelGridCellSize: 120,
        labelRenderedSizeThreshold: 11,
        zIndex: true,
        defaultNodeColor: '#60a5fa',
        defaultEdgeColor: 'rgba(148,163,184,0.36)',
        labelColor: { color: 'rgba(226,232,240,0.86)' },
        labelFont: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
        labelWeight: '500',
        defaultDrawNodeLabel: drawPillLabel,
        defaultDrawNodeHover: drawDarkNodeHover,
        allowInvalidContainer: true,
      });
      sigmaInstance = sigma;
      sigma.getCamera().animatedReset({ duration: 250 });

      const updateFocus = () => {
        const source = selectedRef.current ?? hoveredRef.current;
        neighborsRef.current = new Set<string>();
        edgeFocusRef.current = new Set<string>();

        if (source && graph.hasNode(source)) {
          neighborsRef.current.add(source);
          graph.neighbors(source).forEach((n) => neighborsRef.current.add(n));
          graph.forEachEdge((edgeKey, _attrs, from, to) => {
            if (from === source || to === source) edgeFocusRef.current.add(edgeKey);
          });
        }

        sigma.setSetting('nodeReducer', (node, data) => {
          if (!source) {
            const d = data as { color: string; label: string; size: number };
            const showLabel = majorNodeIds.has(node) || node === hoveredRef.current;
            return {
              ...d,
              color: d.color,
              label: showLabel ? d.label : '',
            };
          }

          const isNeighbor = neighborsRef.current.has(node);
          const d = data as { color: string; label: string; size: number };
          return {
            ...d,
            color: isNeighbor ? d.color : 'rgba(100,116,139,0.22)',
            label: isNeighbor ? d.label : '',
            zIndex: node === source ? 2 : isNeighbor ? 1 : 0,
            size: node === source ? Math.max(d.size * 1.2, d.size + 2) : d.size,
          };
        });

        sigma.setSetting('edgeReducer', (edge, data) => {
          if (!source) {
            const d = data as { size: number };
            return {
              ...d,
              color: 'rgba(148,163,184,0.28)',
              hidden: false,
            };
          }

          const isFocused = edgeFocusRef.current.has(edge);
          const d = data as { size: number };
          return {
            ...d,
            color: isFocused ? 'rgba(125,211,252,0.88)' : 'rgba(100,116,139,0.10)',
            hidden: false,
            size: isFocused ? Math.max(d.size * 1.1, d.size + 0.4) : d.size,
          };
        });

        sigma.refresh();
      };

      sigma.on('enterNode', ({ node }) => {
        hoveredRef.current = node;
        updateFocus();
      });

      sigma.on('leaveNode', () => {
        hoveredRef.current = null;
        updateFocus();
      });

      sigma.on('clickNode', ({ node, event }) => {
        event.preventSigmaDefault();
        selectedRef.current = selectedRef.current === node ? null : node;
        setActiveNodeId(selectedRef.current);
        onNodeClick?.(node);
        updateFocus();
      });

      sigma.on('clickStage', () => {
        selectedRef.current = null;
        setActiveNodeId(null);
        updateFocus();
      });

      updateFocus();
    };

    void mount();
    return () => {
      disposed = true;
      sigmaInstance?.kill();
    };
  }, [connectedEdges, connectedNodes, lanes, majorNodeIds, onNodeClick]);

  const activeNode = activeNodeId ? nodeById.get(activeNodeId) : null;
  const related = activeNode
    ? connectedEdges.filter(
        (edge) => edge.from.id === activeNode.id || edge.to.id === activeNode.id
      )
    : [];

  return (
    <div>
      <div className="px-4 py-2 border-b border-white/10 flex flex-wrap items-center gap-2">
        {laneNames.map((lane) => (
          <span
            key={lane}
            className="text-[11px] rounded-full bg-white/10 border border-white/10 px-2 py-1 text-white/70"
          >
            {lane}
          </span>
        ))}
      </div>

      <div
        ref={containerRef}
        style={{ height: `${Math.max(460, height)}px` }}
        className="w-full bg-[radial-gradient(circle_at_40%_0%,rgba(148,163,184,0.06),rgba(2,6,23,0.2)_45%,rgba(2,6,23,0.28)_100%)]"
      />

      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/55">
        {activeNode ? (
          <div className="space-y-1">
            <p className="text-white/80">
              Focus: {activeNode.title} ({activeNode.kind})
            </p>
            {related.slice(0, 4).map((edge, i) => {
              const other = edge.from.id === activeNode.id ? edge.to.title : edge.from.title;
              return (
                <p key={`${edge.idea}-${i}`}>
                  {edge.idea} -&gt; {other}
                </p>
              );
            })}
          </div>
        ) : (
          <p>
            Hover a node to highlight its neighborhood. Click to lock focus. Click empty space to
            reset.
          </p>
        )}
      </div>
    </div>
  );
}
