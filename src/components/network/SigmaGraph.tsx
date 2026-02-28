import { useEffect, useMemo, useRef, useState } from 'react';
import Graph from 'graphology';
import type { NetworkNode } from '../../config/network';
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
  const [inspectedNodeId, setInspectedNodeId] = useState<string | null>(null);

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
  const kindIcon: Record<NetworkNode['kind'], string> = useMemo(
    () => ({
      Education: '🎓',
      Research: '📚',
      Project: '🚀',
      Org: '🏢',
      Event: '⚡',
      Experience: '🧩',
    }),
    []
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
          icon: kindIcon[node.kind],
          color: kindColor[node.kind] ?? '#93c5fd',
        });
      }

      const mergedEdges = new Map<
        string,
        {
          from: string;
          to: string;
          style: 'solid' | 'dotted';
          strength: number;
          ideas: string[];
        }
      >();

      for (const edge of connectedEdges) {
        if (!graph.hasNode(edge.from.id) || !graph.hasNode(edge.to.id)) continue;
        const key = `${edge.from.id}|${edge.to.id}|${edge.style}`;
        const existing = mergedEdges.get(key);
        if (!existing) {
          mergedEdges.set(key, {
            from: edge.from.id,
            to: edge.to.id,
            style: edge.style,
            strength: edge.strength,
            ideas: [edge.idea],
          });
          continue;
        }
        existing.strength = Math.max(existing.strength, edge.strength);
        if (!existing.ideas.includes(edge.idea)) existing.ideas.push(edge.idea);
      }

      let edgeIndex = 0;
      for (const edge of mergedEdges.values()) {
        const isDotted = edge.style === 'dotted';
        const label =
          edge.ideas.length > 1 ? `${edge.ideas[0]} (+${edge.ideas.length - 1})` : edge.ideas[0];
        graph.addEdgeWithKey(`edge-${edgeIndex}`, edge.from, edge.to, {
          color: isDotted ? 'rgba(148,163,184,0.36)' : 'rgba(148,163,184,0.6)',
          size: isDotted ? 0.8 + edge.strength * 0.35 : 1 + edge.strength * 0.6,
          label,
          style: edge.style,
          ideas: edge.ideas,
        });
        edgeIndex += 1;
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
        data: { x: number; y: number; size: number; label: string | null; icon?: string },
        settings: { labelFont: string; labelSize: number; labelWeight: string }
      ) => {
        const text = data.label;
        const icon = data.icon ?? '';

        if (icon) {
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.font = `600 ${Math.max(8, data.size * 1.05)}px ${settings.labelFont}`;
          context.fillStyle = 'rgba(248, 250, 252, 0.96)';
          context.fillText(icon, data.x, data.y + 0.5);
          context.textAlign = 'start';
          context.textBaseline = 'alphabetic';
        }

        if (!text || text === icon) return;

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
        data: {
          x: number;
          y: number;
          size: number;
          label: string | null;
          color: string;
          icon?: string;
        },
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

        if (data.icon) {
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.font = `600 ${Math.max(9, size * 1.05)}px ${settings.labelFont}`;
          context.fillStyle = 'rgba(248, 250, 252, 0.98)';
          context.fillText(data.icon, x, y + 0.5);
          context.textAlign = 'start';
          context.textBaseline = 'alphabetic';
        }

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
        renderEdgeLabels: false,
        labelSize: 11,
        labelDensity: 1,
        labelGridCellSize: 120,
        labelRenderedSizeThreshold: 0,
        zIndex: true,
        defaultNodeColor: '#60a5fa',
        defaultEdgeColor: 'rgba(148,163,184,0.36)',
        labelColor: { color: 'rgba(226,232,240,0.86)' },
        edgeLabelColor: { color: 'rgba(203,213,225,0.92)' },
        edgeLabelSize: 10,
        edgeLabelWeight: '500',
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
          const d = data as { color: string; label: string; size: number; icon?: string };
          if (!source) {
            const showLabel = majorNodeIds.has(node) || node === hoveredRef.current;
            return {
              ...d,
              color: d.color,
              label: showLabel ? d.label : (d.icon ?? ''),
            };
          }

          const isNeighbor = neighborsRef.current.has(node);
          return {
            ...d,
            color: isNeighbor ? d.color : 'rgba(100,116,139,0.22)',
            label: isNeighbor ? d.label : (d.icon ?? ''),
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
          const d = data as { size: number; style?: 'solid' | 'dotted' };
          const dotted = d.style === 'dotted';
          return {
            ...d,
            color: dotted
              ? isFocused
                ? 'rgba(125,211,252,0.55)'
                : 'rgba(100,116,139,0.10)'
              : isFocused
                ? 'rgba(125,211,252,0.88)'
                : 'rgba(100,116,139,0.10)',
            hidden: false,
            size: isFocused
              ? Math.max(dotted ? d.size * 1.05 : d.size * 1.1, d.size + (dotted ? 0.2 : 0.4))
              : d.size,
          };
        });

        sigma.setSetting('renderEdgeLabels', Boolean(source));
        sigma.refresh();
      };

      sigma.on('enterNode', ({ node }) => {
        hoveredRef.current = node;
        if (!selectedRef.current) setInspectedNodeId(node);
        updateFocus();
      });

      sigma.on('leaveNode', () => {
        hoveredRef.current = null;
        if (!selectedRef.current) setInspectedNodeId(null);
        updateFocus();
      });

      sigma.on('clickNode', ({ node, event }) => {
        event.preventSigmaDefault();
        selectedRef.current = selectedRef.current === node ? null : node;
        setActiveNodeId(selectedRef.current);
        setInspectedNodeId(selectedRef.current);
        onNodeClick?.(node);
        updateFocus();
      });

      sigma.on('clickStage', () => {
        selectedRef.current = null;
        setActiveNodeId(null);
        setInspectedNodeId(null);
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
  const inspectedNode = inspectedNodeId ? nodeById.get(inspectedNodeId) : null;
  const related = activeNode
    ? connectedEdges.filter(
        (edge) => edge.from.id === activeNode.id || edge.to.id === activeNode.id
      )
    : [];
  const inspectedRelated = inspectedNode
    ? connectedEdges.filter(
        (edge) => edge.from.id === inspectedNode.id || edge.to.id === inspectedNode.id
      )
    : [];

  return (
    <div className="relative">
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

      <aside className="absolute right-4 top-14 w-[300px] max-w-[38vw] rounded-xl border border-white/10 bg-slate-950/85 backdrop-blur-md p-3 text-xs text-slate-200 shadow-2xl">
        {inspectedNode ? (
          <div className="space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                {inspectedNode.kind} · W{inspectedNode.weight}
              </p>
              <h3 className="mt-1 text-sm font-semibold text-white">
                {kindIcon[inspectedNode.kind]} {inspectedNode.title}
              </h3>
              <p className="text-slate-300/85">{inspectedNode.subtitle}</p>
              {inspectedNode.period && <p className="text-slate-400">{inspectedNode.period}</p>}
            </div>

            <ul className="space-y-1">
              {inspectedNode.bullets.slice(0, 3).map((bullet, i) => (
                <li key={i} className="text-slate-300/90">
                  - {bullet}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1">
              {inspectedNode.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">
                Connections ({inspectedRelated.length})
              </p>
              <div className="mt-1 space-y-1 max-h-28 overflow-auto pr-1">
                {inspectedRelated.slice(0, 8).map((edge, i) => {
                  const outbound = edge.from.id === inspectedNode.id;
                  const otherId = outbound ? edge.to.id : edge.from.id;
                  const otherTitle = outbound ? edge.to.title : edge.from.title;
                  return (
                    <p key={`${otherId}-${i}`} className="text-slate-300/85">
                      <span className="text-slate-100">{edge.idea}</span> -&gt; {otherTitle}
                      {edge.style === 'dotted' ? (
                        <span className="ml-1 text-slate-500">(foundation)</span>
                      ) : null}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {inspectedNode.links?.url && (
                <a
                  href={inspectedNode.links.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
                >
                  Open
                </a>
              )}
              {inspectedNode.links?.repo && (
                <a
                  href={inspectedNode.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
                >
                  Repo
                </a>
              )}
              {inspectedNode.links?.article && (
                <a
                  href={inspectedNode.links.article}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white/10 px-2 py-1 text-[11px] hover:bg-white/20"
                >
                  Article
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-slate-300/80">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Graph Inspector
            </p>
            <p>Hover a node for details.</p>
            <p>Click to lock focus and show edge labels.</p>
            <p>Click empty space to reset.</p>
          </div>
        )}
      </aside>

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
