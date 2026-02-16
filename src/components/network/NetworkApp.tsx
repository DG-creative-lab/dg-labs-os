import { useMemo, useState } from 'react';
import type { NetworkNode } from '../../config/network';
import { buildGraph } from '../../utils/networkGraph';
import { filterNetworkNodes, type KindFilter } from '../../utils/networkSearch';

type ViewMode = 'LIST' | 'GRAPH';

type Props = {
  nodes: readonly NetworkNode[];
};

const kindLabel: Record<KindFilter, string> = {
  ALL: 'All',
  Org: 'Companies',
  Project: 'Projects',
  Idea: 'Ideas',
};

export default function NetworkApp({ nodes }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<KindFilter>('ALL');
  const [view, setView] = useState<ViewMode>('LIST');

  const filtered = useMemo(() => filterNetworkNodes(nodes, filter, query), [nodes, query, filter]);

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-black/30 border border-white/10 px-3 py-1.5">
          <span className="text-xs text-white/50">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tags, roles, systems..."
            className="bg-transparent text-sm text-white placeholder:text-white/30 outline-none w-[220px] max-w-[60vw]"
            aria-label="Search network"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(Object.keys(kindLabel) as KindFilter[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`text-sm rounded-full px-3 py-1.5 border transition ${
                filter === k
                  ? 'bg-white/15 border-white/25 text-white'
                  : 'bg-white/10 border-white/10 text-white/80 hover:bg-white/15'
              }`}
            >
              {kindLabel[k]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-white/50">{filtered.length} nodes</span>
          <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setView('LIST')}
              className={`text-xs rounded-full px-3 py-1.5 transition ${
                view === 'LIST' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('GRAPH')}
              className={`text-xs rounded-full px-3 py-1.5 transition ${
                view === 'GRAPH' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              Graph
            </button>
          </div>
        </div>
      </div>

      {view === 'GRAPH' ? <Graph nodes={filtered} /> : <List nodes={filtered} />}
    </div>
  );
}

function List({ nodes }: { nodes: readonly NetworkNode[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {nodes.map((n) => (
        <section
          key={n.id}
          id={`node-${n.id}`}
          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/7 transition"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{n.title}</h2>
              <p className="text-sm text-white/60">{n.subtitle}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{n.kind}</span>
              {n.period && <p className="mt-1 text-xs text-white/40">{n.period}</p>}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {n.tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="text-[11px] rounded-full bg-black/30 border border-white/10 px-2 py-1 text-white/60"
              >
                {t}
              </span>
            ))}
          </div>

          <ul className="mt-4 space-y-1 text-sm text-white/70">
            {n.bullets.slice(0, 4).map((b, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-white/40">-</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            {n.links?.url && (
              <a
                className="text-sm rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20 transition"
                href={n.links.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>
            )}
            {n.links?.repo && (
              <a
                className="text-sm rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20 transition"
                href={n.links.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                Repo
              </a>
            )}
            {n.links?.article && (
              <a
                className="text-sm rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20 transition"
                href={n.links.article}
                target="_blank"
                rel="noopener noreferrer"
              >
                Article
              </a>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function Graph({ nodes }: { nodes: readonly NetworkNode[] }) {
  const { graphNodes, edges } = useMemo(() => buildGraph(nodes), [nodes]);

  // Render as an SVG map with a light grid to keep it “OS-like” but readable.
  const width = 960;
  const maxY = graphNodes.length ? Math.max(...graphNodes.map((n) => n.y)) : 0;
  const height = Math.max(420, Math.round(maxY + 120));

  const jumpTo = (id: string) => {
    const el = document.getElementById(`node-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-black/30 backdrop-blur-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Graph Mode</p>
          <p className="text-xs text-white/50">
            Writing -&gt; Systems -&gt; Platforms (tag-similarity links)
          </p>
        </div>
        <p className="text-xs text-white/50">
          {graphNodes.length} nodes, {edges.length} edges
        </p>
      </div>

      <div className="overflow-auto">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
          <defs>
            <linearGradient id="edge" x1="0" x2="1">
              <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
              <stop offset="100%" stopColor="rgba(244,114,182,0.22)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map((e, i) => (
            <line
              key={i}
              x1={e.from.x}
              y1={e.from.y}
              x2={e.to.x}
              y2={e.to.y}
              stroke="url(#edge)"
              strokeWidth={2}
              opacity={0.9}
            />
          ))}

          {graphNodes.map((n) => (
            <g
              key={n.id}
              filter="url(#glow)"
              onClick={() => jumpTo(n.id)}
              style={{ cursor: 'pointer' }}
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  jumpTo(n.id);
                }
              }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={16}
                fill="rgba(255,255,255,0.10)"
                stroke="rgba(255,255,255,0.16)"
              />
              <circle cx={n.x} cy={n.y} r={7} fill="rgba(56,189,248,0.9)" />
              <text
                x={n.x + 24}
                y={n.y + 4}
                fill="rgba(255,255,255,0.82)"
                fontSize="12"
                fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
              >
                {n.title}
              </text>
              <text
                x={n.x + 24}
                y={n.y + 18}
                fill="rgba(255,255,255,0.45)"
                fontSize="10"
                fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
              >
                {n.kind}
              </text>
            </g>
          ))}

          <g opacity="0.9">
            <text x="80" y="36" fill="rgba(255,255,255,0.55)" fontSize="11">
              Writing
            </text>
            <text x="380" y="36" fill="rgba(255,255,255,0.55)" fontSize="11">
              Systems
            </text>
            <text x="680" y="36" fill="rgba(255,255,255,0.55)" fontSize="11">
              Platforms
            </text>
          </g>
        </svg>
      </div>

      <div className="px-4 py-3 border-t border-white/10 text-xs text-white/50">
        Tip: click a node to jump to its card in list mode.
      </div>
    </div>
  );
}
