import Graph from 'graphology';
import type { NetworkIdeaEdge, NetworkNode } from '../config/network';

export type NetworkModel = {
  graph: Graph;
  nodesById: ReadonlyMap<string, NetworkNode>;
  edgesById: ReadonlyMap<string, NetworkIdeaEdge>;
};

export const buildNetworkModel = (
  nodes: readonly NetworkNode[],
  edges: readonly NetworkIdeaEdge[]
): NetworkModel => {
  const graph = new Graph({ multi: true, type: 'directed', allowSelfLoops: false });
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const edgesById = new Map(edges.map((edge) => [edge.id, edge]));

  for (const node of nodes) {
    graph.addNode(node.id, { node });
  }

  for (const edge of edges) {
    if (!graph.hasNode(edge.from) || !graph.hasNode(edge.to)) continue;
    graph.addDirectedEdgeWithKey(edge.id, edge.from, edge.to, { relationship: edge });
  }

  return { graph, nodesById, edgesById };
};

export const getNodeRelationships = (
  model: NetworkModel,
  nodeId: string
): readonly NetworkIdeaEdge[] => {
  if (!model.graph.hasNode(nodeId)) return [];

  const relationships: NetworkIdeaEdge[] = [];
  model.graph.forEachEdge(nodeId, (_edgeId, attributes) => {
    const relationship = attributes.relationship as NetworkIdeaEdge | undefined;
    if (relationship) relationships.push(relationship);
  });

  return relationships;
};

export const getRelatedNode = (
  model: NetworkModel,
  relationship: NetworkIdeaEdge,
  nodeId: string
): NetworkNode | undefined => {
  const relatedId = relationship.from === nodeId ? relationship.to : relationship.from;
  return model.nodesById.get(relatedId);
};
