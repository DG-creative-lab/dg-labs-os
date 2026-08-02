import { useEffect, useMemo, useState } from 'react';
import type {
  NetworkKind,
  NetworkNode,
  NetworkPath,
  NetworkRelationship,
} from '../../profiles/network';
import {
  handleNetworkMenuAction,
  type NetworkMenuEventDetail,
} from '../../services/menuActionHandlers';
import { buildNetworkModel, getNodeRelationships, getRelatedNode } from '../../utils/networkGraph';
import { filterNetworkNodes } from '../../utils/networkSearch';
import SystemMapGraph from './SystemMapGraph';

type ViewMode = 'MAP' | 'INDEX';
type CategoryFilter = 'ALL' | NetworkKind;

type Props = {
  nodes: readonly NetworkNode[];
  ideas?: readonly NetworkRelationship[];
  paths?: readonly NetworkPath[];
  initialView?: ViewMode;
  compact?: boolean;
};

const categoryFilters: readonly CategoryFilter[] = [
  'ALL',
  'Foundation',
  'Career',
  'Practice',
  'System',
  'Evidence',
];

const categoryLabel: Record<CategoryFilter, string> = {
  ALL: 'All',
  Foundation: 'Foundations',
  Career: 'Career',
  Practice: 'Practices',
  System: 'Systems',
  Evidence: 'Evidence',
};

const confidenceLabel: Record<NetworkRelationship['confidence'], string> = {
  direct: 'Direct',
  supported: 'Supported',
  interpretive: 'Interpretive',
};

const nodeConfidenceLabel: Record<NetworkNode['evidenceConfidence'], string> = {
  verified: 'Verified',
  'self-reported': 'Self-reported',
  inferred: 'Inferred',
};

const evidenceVisibilityLabel: Record<NetworkRelationship['evidenceVisibility'], string> = {
  public: 'Public evidence',
  'private-employer': 'Private evidence boundary',
  mixed: 'Mixed evidence',
};

export default function NetworkApp({
  nodes,
  ideas = [],
  paths = [],
  initialView = 'MAP',
  compact = false,
}: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('ALL');
  const [view, setView] = useState<ViewMode>(initialView);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const model = useMemo(() => buildNetworkModel(nodes, ideas), [ideas, nodes]);
  const activePath = useMemo(
    () => paths.find((path) => path.id === activePathId) ?? null,
    [activePathId, paths]
  );

  const filtered = useMemo(() => filterNetworkNodes(nodes, filter, query), [filter, nodes, query]);

  const activeNodeIds = useMemo(() => {
    if (activePath) return new Set(activePath.nodeIds);
    if (filter !== 'ALL' || query.trim()) return new Set(filtered.map((node) => node.id));
    return new Set<string>();
  }, [activePath, filter, filtered, query]);

  const activeEdgeIds = useMemo(() => new Set(activePath?.relationshipIds ?? []), [activePath]);

  const indexNodes = useMemo(() => {
    const pathNodeIds = activePath ? new Set(activePath.nodeIds) : null;
    return filtered.filter((node) => !pathNodeIds || pathNodeIds.has(node.id));
  }, [activePath, filtered]);

  const selectedNode = selectedNodeId ? (model.nodesById.get(selectedNodeId) ?? null) : null;
  const selectedRelationships = useMemo(
    () => (selectedNode ? getNodeRelationships(model, selectedNode.id) : []),
    [model, selectedNode]
  );

  useEffect(() => {
    const handleMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<NetworkMenuEventDetail>;
      handleNetworkMenuAction(customEvent.detail, {
        setFilter: (nextFilter) => {
          setFilter(nextFilter);
          setActivePathId(null);
        },
        setView,
        setQuery: (nextQuery) => {
          setQuery(nextQuery);
          setActivePathId(null);
        },
      });
    };

    window.addEventListener('dg-network-menu-action', handleMenuAction as EventListener);
    return () => {
      window.removeEventListener('dg-network-menu-action', handleMenuAction as EventListener);
    };
  }, []);

  const selectPath = (path: NetworkPath) => {
    const nextPathId = path.id === activePathId ? null : path.id;
    setActivePathId(nextPathId);
    setQuery('');
    setFilter('ALL');
    setSelectedNodeId(nextPathId ? path.nodeIds[0] : null);
  };

  const selectFilter = (nextFilter: CategoryFilter) => {
    setFilter(nextFilter);
    setActivePathId(null);
    setSelectedNodeId(null);
  };

  return (
    <section className="mt-5 text-white">
      <section className="border-y border-white/12 py-4" aria-labelledby="guided-paths-title">
        <div className="grid grid-cols-4 gap-4 md:grid-cols-12">
          <div className="col-span-4 md:col-span-3">
            <h2
              id="guided-paths-title"
              className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200"
            >
              Guided paths
            </h2>
            <p className="mt-2 text-xs leading-5 text-white/45">
              Start with a question. The map will reveal only the relationships needed to answer it.
            </p>
          </div>
          <div className="col-span-4 border-t border-white/12 md:col-span-9">
            {paths.map((path, index) => {
              const isActive = path.id === activePathId;
              return (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => selectPath(path)}
                  className={`grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-3 border-b border-white/12 py-3 text-left transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300 ${
                    isActive ? 'text-sky-100' : 'text-white/75 hover:text-white'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="font-mono text-[10px] text-sky-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium">{path.question}</span>
                  <span className="font-mono text-xs text-sky-300">{isActive ? '×' : '→'}</span>
                  {isActive ? (
                    <span className="col-start-2 text-xs leading-5 text-white/55">
                      {path.answer}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-4 gap-x-4 gap-y-3 border-b border-white/12 py-4 md:grid-cols-12">
        <label className="col-span-4 flex items-center border-b border-white/18 pb-2 md:col-span-4">
          <span className="sr-only">Search system map</span>
          <span className="mr-3 font-mono text-[10px] uppercase tracking-[0.12em] text-white/38">
            Search
          </span>
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActivePathId(null);
            }}
            placeholder="System, practice, evidence…"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
            aria-label="Search system map"
          />
        </label>

        <div className="col-span-4 flex flex-wrap items-center gap-x-4 gap-y-2 md:col-span-6">
          {categoryFilters.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectFilter(category)}
              className={`border-b pb-1 text-xs transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300 ${
                filter === category && !activePath
                  ? 'border-sky-300 text-sky-100'
                  : 'border-transparent text-white/48 hover:text-white'
              }`}
              aria-pressed={filter === category && !activePath}
            >
              {categoryLabel[category]}
            </button>
          ))}
        </div>

        <div className="col-span-4 flex items-center justify-between gap-4 md:col-span-2 md:justify-end">
          <span className="font-mono text-[10px] text-white/35">
            {indexNodes.length.toString().padStart(2, '0')} / {nodes.length}
          </span>
          <div className="flex border border-white/15">
            <button
              type="button"
              onClick={() => setView('MAP')}
              className={`px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300 ${
                view === 'MAP' ? 'bg-sky-300 text-slate-950' : 'text-white/50 hover:text-white'
              }`}
              aria-pressed={view === 'MAP'}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setView('INDEX')}
              className={`border-l border-white/15 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.1em] transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300 ${
                view === 'INDEX' ? 'bg-sky-300 text-slate-950' : 'text-white/50 hover:text-white'
              }`}
              aria-pressed={view === 'INDEX'}
            >
              Index
            </button>
          </div>
        </div>
      </div>

      {view === 'MAP' ? (
        <div className={`grid grid-cols-4 gap-4 py-4 ${compact ? '' : 'lg:grid-cols-12 lg:gap-5'}`}>
          <div className={`col-span-4 ${compact ? '' : 'lg:col-span-9'}`}>
            <SystemMapGraph
              nodes={nodes}
              edges={ideas}
              selectedNodeId={selectedNodeId}
              activeNodeIds={activeNodeIds}
              activeEdgeIds={activeEdgeIds}
              onSelectNode={setSelectedNodeId}
            />
          </div>
          <div className={`col-span-4 ${compact ? '' : 'lg:col-span-3'}`}>
            <Inspector
              node={selectedNode}
              relationships={selectedRelationships}
              model={model}
              activePath={activePath}
            />
          </div>
        </div>
      ) : compact ? (
        <CompactIndex nodes={indexNodes} ideas={ideas} model={model} />
      ) : (
        <div className="grid grid-cols-12 gap-5 py-4">
          <div className="col-span-8">
            <NodeIndex
              nodes={indexNodes}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>
          <div className="col-span-4">
            <Inspector
              node={selectedNode}
              relationships={selectedRelationships}
              model={model}
              activePath={activePath}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function Inspector({
  node,
  relationships,
  model,
  activePath,
}: {
  node: NetworkNode | null;
  relationships: readonly NetworkRelationship[];
  model: ReturnType<typeof buildNetworkModel>;
  activePath: NetworkPath | null;
}) {
  if (!node) {
    return (
      <aside className="h-full border-l border-white/12 pl-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
          Inspector
        </p>
        <h3 className="mt-4 text-lg font-semibold">
          {activePath ? activePath.question : 'Select a node'}
        </h3>
        <p className="mt-3 text-sm leading-6 text-white/55">
          {activePath
            ? activePath.answer
            : 'Inspect provenance, limitations, and the evidence behind each relationship.'}
        </p>
      </aside>
    );
  }

  return (
    <aside className="h-full border-l border-white/12 pl-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
          {node.kind}
        </p>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/38">
          {node.evidence}
        </span>
      </div>
      <h3 className="mt-3 text-xl font-semibold leading-tight">{node.title}</h3>
      <p className="mt-1 text-xs leading-5 text-white/52">{node.subtitle}</p>
      {node.period ? (
        <p className="mt-2 font-mono text-[10px] text-white/34">{node.period}</p>
      ) : null}

      <div className="mt-5 border-t border-white/12 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Provenance</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/32">
            {nodeConfidenceLabel[node.evidenceConfidence]} /{' '}
            {evidenceVisibilityLabel[node.evidenceVisibility]}
          </p>
        </div>
        <p className="mt-2 text-xs leading-5 text-white/65">{node.provenance}</p>
      </div>

      <div className="mt-4 border-t border-white/12 pt-4">
        <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">Boundary</p>
        <p className="mt-2 text-xs leading-5 text-white/55">{node.boundary}</p>
      </div>

      <div className="mt-4 border-t border-white/12 pt-4">
        <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">
          Relationships / {relationships.length.toString().padStart(2, '0')}
        </p>
        <div className="mt-2 divide-y divide-white/8">
          {relationships.slice(0, 6).map((relationship) => {
            const related = getRelatedNode(model, relationship, node.id);
            return (
              <div key={relationship.id} className="py-2.5">
                <p className="text-xs text-white/72">
                  <span className="text-sky-200">{relationship.relation}</span>{' '}
                  {related?.title ?? 'Unknown node'}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-white/38">{relationship.evidence}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/28">
                  {confidenceLabel[relationship.confidence]} /{' '}
                  {evidenceVisibilityLabel[relationship.evidenceVisibility]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/12 pt-4">
        {node.links?.url ? <InspectorLink href={node.links.url}>Open</InspectorLink> : null}
        {node.links?.repo ? <InspectorLink href={node.links.repo}>Repository</InspectorLink> : null}
        {node.links?.article ? (
          <InspectorLink href={node.links.article}>Evidence</InspectorLink>
        ) : null}
      </div>
    </aside>
  );
}

function InspectorLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-sky-300/35 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-100 transition hover:bg-sky-300/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300"
    >
      {children} ↗
    </a>
  );
}

function NodeIndex({
  nodes,
  selectedNodeId,
  onSelectNode,
}: {
  nodes: readonly NetworkNode[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <ol className="border-t border-white/15">
      {nodes.map((node, index) => (
        <li key={node.id} className="border-b border-white/12">
          <button
            type="button"
            onClick={() => onSelectNode(node.id)}
            className={`grid w-full grid-cols-[2.5rem_1fr_7rem] gap-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300 ${
              selectedNodeId === node.id ? 'text-sky-100' : 'text-white/72 hover:text-white'
            }`}
          >
            <span className="font-mono text-[10px] text-sky-300">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>
              <span className="block text-sm font-semibold">{node.title}</span>
              <span className="mt-1 block text-xs leading-5 text-white/42">{node.subtitle}</span>
            </span>
            <span className="text-right font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">
              {node.kind}
              <span className="mt-1 block">{node.evidence}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function CompactIndex({
  nodes,
  ideas,
  model,
}: {
  nodes: readonly NetworkNode[];
  ideas: readonly NetworkRelationship[];
  model: ReturnType<typeof buildNetworkModel>;
}) {
  return (
    <div className="py-4">
      <p className="mb-3 text-xs leading-5 text-white/45">
        The mobile index keeps every relationship readable. Choose Map when spatial exploration is
        useful.
      </p>
      <div className="border-t border-white/15">
        {nodes.map((node, index) => {
          const relationships = ideas.filter(
            (relationship) => relationship.from === node.id || relationship.to === node.id
          );
          return (
            <details key={node.id} className="group border-b border-white/12">
              <summary className="grid cursor-pointer list-none grid-cols-[2rem_1fr_auto] gap-3 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-300">
                <span className="font-mono text-[10px] text-sky-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{node.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/42">
                    {node.subtitle}
                  </span>
                </span>
                <span className="font-mono text-xs text-sky-300 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="grid grid-cols-4 gap-3 pb-5 pl-8">
                <div className="col-span-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-white/32">
                    Provenance / {nodeConfidenceLabel[node.evidenceConfidence]} /{' '}
                    {evidenceVisibilityLabel[node.evidenceVisibility]}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/62">{node.provenance}</p>
                </div>
                <div className="col-span-4 border-t border-white/8 pt-3">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-white/32">Boundary</p>
                  <p className="mt-1 text-xs leading-5 text-white/52">{node.boundary}</p>
                </div>
                {relationships.length > 0 ? (
                  <div className="col-span-4 border-t border-white/8 pt-3">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-white/32">
                      Relationships
                    </p>
                    {relationships.slice(0, 5).map((relationship) => {
                      const related = getRelatedNode(model, relationship, node.id);
                      return (
                        <div key={relationship.id} className="mt-3 border-t border-white/8 pt-3">
                          <p className="text-xs leading-5 text-white/68">
                            <span className="text-sky-200">{relationship.relation}</span>{' '}
                            {related?.title}
                          </p>
                          <p className="mt-1 text-[10px] leading-4 text-white/42">
                            {relationship.evidence}
                          </p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-white/28">
                            {confidenceLabel[relationship.confidence]} /{' '}
                            {evidenceVisibilityLabel[relationship.evidenceVisibility]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
