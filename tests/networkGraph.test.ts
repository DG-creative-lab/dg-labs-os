import { describe, expect, it } from 'vitest';
import { dessiNetworkModule } from '../src/profiles/network';
import { buildNetworkModel, getNodeRelationships, getRelatedNode } from '../src/utils/networkGraph';

describe('system map model', () => {
  it('builds the curated nodes and typed relationships in Graphology', () => {
    const model = buildNetworkModel(dessiNetworkModule.nodes, dessiNetworkModule.relationships);

    expect(model.graph.order).toBe(dessiNetworkModule.nodes.length);
    expect(model.graph.size).toBe(dessiNetworkModule.relationships.length);
    expect(model.graph.type).toBe('directed');
  });

  it('resolves relationships and their neighboring nodes', () => {
    const model = buildNetworkModel(dessiNetworkModule.nodes, dessiNetworkModule.relationships);
    const relationships = getNodeRelationships(model, 'system-agentic-commerce');

    expect(relationships.length).toBeGreaterThan(0);
    expect(relationships.some((edge) => edge.relation === 'documented by')).toBe(true);

    const writingRelationship = relationships.find((edge) => edge.id === 'commerce-to-writing');
    expect(writingRelationship).toBeDefined();
    expect(
      writingRelationship
        ? getRelatedNode(model, writingRelationship, 'system-agentic-commerce')?.id
        : null
    ).toBe('evidence-technical-writing');
  });
});
