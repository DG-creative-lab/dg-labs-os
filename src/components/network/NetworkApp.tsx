import { useMemo, useState } from 'react';
import type { NetworkIdeaEdge, NetworkNode } from '../../config/network';
import { buildGraph } from '../../utils/networkGraph';
import { filterNetworkNodes } from '../../utils/networkSearch';
import SigmaGraph from './SigmaGraph';

type ViewMode = 'LIST' | 'GRAPH';

type Props = {
  nodes: readonly NetworkNode[];
  ideas?: readonly NetworkIdeaEdge[];
};

type CategoryFilter = 'ALL' | 'Education' | 'Research' | 'Projects' | 'Experience';

const kindLabel: Record<CategoryFilter, string> = {
  ALL: 'All',
  Education: 'Education',
  Research: 'Research',
  Projects: 'Projects',
  Experience: 'Experience',
};

const matchesCategory = (node: NetworkNode, filter: CategoryFilter) => {
  if (filter === 'ALL') return true;
  if (filter === 'Projects') return node.kind === 'Project';
  if (filter === 'Experience') {
    return node.kind === 'Experience' || node.kind === 'Org' || node.kind === 'Event';
  }
  return node.kind === filter;
};

export default function NetworkApp({ nodes, ideas = [] }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [view, setView] = useState<ViewMode>('LIST');

  const filtered = useMemo(() => {
    const searched = filterNetworkNodes(nodes, 'ALL', query);
    return searched.filter((node) => matchesCategory(node, filter));
  }, [nodes, query, filter]);

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
          {(Object.keys(kindLabel) as CategoryFilter[]).map((k) => (
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

      {view === 'GRAPH' ? <Graph nodes={filtered} ideas={ideas} /> : <List nodes={filtered} />}
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
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                {n.kind} · W{n.weight}
              </span>
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

function Graph({
  nodes,
  ideas,
}: {
  nodes: readonly NetworkNode[];
  ideas: readonly NetworkIdeaEdge[];
}) {
  const { graphNodes, edges, lanes, height } = useMemo(
    () => buildGraph(nodes, ideas),
    [nodes, ideas]
  );

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
            Facts as nodes, ideas as weighted edges. Interactive focus mode enabled.
          </p>
        </div>
        <p className="text-xs text-white/50">
          {graphNodes.length} nodes, {edges.length} edges
        </p>
      </div>
      <SigmaGraph
        nodes={graphNodes}
        edges={edges}
        lanes={lanes}
        height={height}
        onNodeClick={(id) => jumpTo(id)}
      />
    </div>
  );
}
