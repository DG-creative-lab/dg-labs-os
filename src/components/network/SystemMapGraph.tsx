import { useMemo } from 'react';
import {
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { NetworkNode, NetworkRelationship } from '../../profiles/network';

type MapNodeData = {
  item: NetworkNode;
  active: boolean;
  muted: boolean;
  selected: boolean;
  onSelect: (nodeId: string) => void;
};

type MapNode = Node<MapNodeData, 'system-map'>;

type Props = {
  nodes: readonly NetworkNode[];
  edges: readonly NetworkRelationship[];
  selectedNodeId: string | null;
  activeNodeIds: ReadonlySet<string>;
  activeEdgeIds: ReadonlySet<string>;
  onSelectNode: (nodeId: string) => void;
};

const kindNumber: Record<NetworkNode['kind'], string> = {
  Foundation: '01',
  Career: '02',
  Practice: '03',
  System: '04',
  Evidence: '05',
};

const evidenceLabel: Record<NetworkNode['evidence'], string> = {
  Background: 'Context',
  'Professional context': 'Private',
  'Public artifact': 'Public',
  Practice: 'Pattern',
};

function SystemMapNode({ data }: NodeProps<MapNode>) {
  const { item, active, muted, selected, onSelect } = data;
  const emphasized = selected || active;

  return (
    <button
      type="button"
      data-map-node-id={item.id}
      aria-label={`Inspect ${item.title}`}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
      className={`nodrag nopan w-[172px] border bg-[#171719] px-3 py-2.5 text-left transition duration-200 ${
        emphasized
          ? 'border-sky-300/80 text-white'
          : muted
            ? 'border-white/7 text-white/28'
            : 'border-white/18 text-white/82 hover:border-white/35'
      } focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-300`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-1.5 !w-1.5 !border-0 !bg-white/25"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-1.5 !w-1.5 !border-0 !bg-white/25"
        isConnectable={false}
      />
      <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
        <span className={emphasized ? 'text-sky-200' : 'text-white/38'}>
          {kindNumber[item.kind]} / {item.kind}
        </span>
        <span className={emphasized ? 'text-sky-200' : 'text-white/32'}>
          {evidenceLabel[item.evidence]}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-4">{item.title}</p>
      <p className={`mt-1 text-[10px] leading-4 ${emphasized ? 'text-white/62' : 'text-white/38'}`}>
        {item.subtitle}
      </p>
    </button>
  );
}

const nodeTypes = {
  'system-map': SystemMapNode,
};

const columnX = [0, 230, 470, 700] as const;
const rowHeight = 92;

export default function SystemMapGraph({
  nodes,
  edges,
  selectedNodeId,
  activeNodeIds,
  activeEdgeIds,
  onSelectNode,
}: Props) {
  const hasActivePath = activeNodeIds.size > 0;

  const flowNodes = useMemo<MapNode[]>(
    () =>
      nodes.map((item) => ({
        id: item.id,
        type: 'system-map',
        position: {
          x: columnX[item.map.column],
          y: item.map.row * rowHeight,
        },
        data: {
          item,
          active: activeNodeIds.has(item.id),
          muted: hasActivePath && !activeNodeIds.has(item.id),
          selected: selectedNodeId === item.id,
          onSelect: onSelectNode,
        },
        draggable: false,
        connectable: false,
        selectable: true,
        focusable: false,
      })),
    [activeNodeIds, hasActivePath, nodes, onSelectNode, selectedNodeId]
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((relationship) => {
        const pathActive = activeEdgeIds.has(relationship.id);
        const nodeActive =
          selectedNodeId === relationship.from || selectedNodeId === relationship.to;
        const emphasized = pathActive || nodeActive;
        const muted = hasActivePath && !pathActive;

        return {
          id: relationship.id,
          source: relationship.from,
          target: relationship.to,
          type: 'straight',
          label: emphasized ? relationship.relation : undefined,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 12,
            height: 12,
            color: emphasized ? '#7dd3fc' : 'rgba(148,163,184,0.32)',
          },
          style: {
            stroke: emphasized
              ? '#7dd3fc'
              : muted
                ? 'rgba(148,163,184,0.07)'
                : 'rgba(148,163,184,0.24)',
            strokeWidth: emphasized ? 1.5 : 0.8,
          },
          labelStyle: {
            fill: '#bae6fd',
            fontSize: 9,
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: '#111113',
            fillOpacity: 0.95,
          },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 2,
          animated: false,
          focusable: true,
          ariaLabel: `${relationship.relation}: ${relationship.from} to ${relationship.to}`,
        };
      }),
    [activeEdgeIds, edges, hasActivePath, selectedNodeId]
  );

  return (
    <div
      className="h-[clamp(430px,57vh,620px)] min-h-0 border border-white/12 bg-[#111113]"
      onClickCapture={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>('[data-map-node-id]');
        const nodeId = target?.dataset.mapNodeId;
        if (nodeId) onSelectNode(nodeId);
      }}
    >
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, minZoom: 0.45, maxZoom: 0.92 }}
        minZoom={0.4}
        maxZoom={1.35}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnDoubleClick={false}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          position="bottom-left"
          className="!rounded-sm !border !border-white/15 !bg-[#171719] !shadow-none"
        />
      </ReactFlow>
    </div>
  );
}
