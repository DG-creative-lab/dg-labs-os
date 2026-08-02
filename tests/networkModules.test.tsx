import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import NetworkApp from '../src/components/network/NetworkApp';
import { searchKnowledgeEntries } from '../src/knowledge';
import { buildNetworkModuleKnowledgeEntries } from '../src/profiles/agentEvidence';
import { createPublicProfileRegistry, dessiProfileProjection } from '../src/profiles';
import {
  createPublicNetworkModuleRegistry,
  dessiNetworkModule,
  type PublicNetworkModule,
  validatePublicNetworkModule,
} from '../src/profiles/network';
import { networkModuleV1Fixture } from './fixtures/contracts/networkModuleV1';
import { profileProjectionV1Fixture } from './fixtures/contracts/profileProjectionV1';

describe('public Network modules', () => {
  it('publishes Dessi through a valid, serialisable v1 Network module', () => {
    expect(validatePublicNetworkModule(dessiNetworkModule)).toEqual([]);
    expect(JSON.parse(JSON.stringify(dessiNetworkModule))).toEqual(dessiNetworkModule);
    expect(
      dessiNetworkModule.nodes.every(
        (node) => node.evidenceConfidence && node.evidenceVisibility && node.boundary
      )
    ).toBe(true);
    expect(
      dessiNetworkModule.relationships.every(
        (relationship) =>
          relationship.evidence && relationship.confidence && relationship.evidenceVisibility
      )
    ).toBe(true);
  });

  it('resolves two profiles without crossing their Network records', () => {
    const profiles = createPublicProfileRegistry([
      dessiProfileProjection,
      profileProjectionV1Fixture,
    ]);
    const networks = createPublicNetworkModuleRegistry(
      [dessiNetworkModule, networkModuleV1Fixture],
      profiles
    );

    expect(networks.resolve('contract-fixture').nodes[1].title).toBe('Fixture Network System');
    expect(JSON.stringify(networks.resolve('contract-fixture'))).not.toContain('Agentic Commerce');
    expect(JSON.stringify(networks.resolve('dessi'))).not.toContain('Fixture Network System');
    expect(networks.find('missing')).toBeUndefined();
  });

  it('renders the selected Network without global Dessi content', () => {
    const html = renderToStaticMarkup(
      <NetworkApp
        nodes={networkModuleV1Fixture.nodes}
        ideas={networkModuleV1Fixture.relationships}
        paths={networkModuleV1Fixture.paths}
        initialView="INDEX"
        compact
      />
    );

    expect(html).toContain('Fixture Network System');
    expect(html).toContain('Fixture Foundation');
    expect(html).toContain('Self-reported');
    expect(html).toContain('Public evidence');
    expect(html).toContain('The fixture intentionally connects its two synthetic records.');
    expect(html).not.toContain('Agentic Commerce');
  });

  it('builds bounded Profile Agent knowledge from the selected Network', () => {
    const entries = buildNetworkModuleKnowledgeEntries(networkModuleV1Fixture);
    const hits = searchKnowledgeEntries(entries, 'portable starting node', 5);

    expect(entries).toHaveLength(3);
    expect(hits[0]?.id).toBe('network-fixture-foundation');
    expect(entries[0].content).toContain('Evidence visibility: public.');
    expect(JSON.stringify(entries)).not.toContain('Dessi');
  });

  it('keeps directed relationships canonical from both endpoint entries', () => {
    const entries = buildNetworkModuleKnowledgeEntries(networkModuleV1Fixture);
    const source = entries.find((entry) => entry.id === 'network-fixture-foundation');
    const target = entries.find((entry) => entry.id === 'network-fixture-system');
    const relationship = entries.find(
      (entry) => entry.id === 'network-relationship-fixture-foundation-to-system'
    );

    expect(source?.related).toContain(relationship?.id);
    expect(target?.related).toContain(relationship?.id);
    expect(relationship?.content).toContain(
      'Fixture Foundation (fixture-foundation) informed Fixture Network System (fixture-system).'
    );
    expect(relationship?.content).not.toContain(
      'Fixture Network System (fixture-system) informed Fixture Foundation (fixture-foundation).'
    );
  });

  it('keeps relationship confidence separate from endpoint confidence', () => {
    const entries = buildNetworkModuleKnowledgeEntries(dessiNetworkModule);
    const verifiedNode = entries.find((entry) => entry.id === 'network-system-ai-skills');
    const privateDirectRelationship = entries.find(
      (entry) => entry.id === 'network-relationship-career-data-to-analytics'
    );
    const interpretiveRelationship = entries.find(
      (entry) => entry.id === 'network-relationship-skills-to-dgos'
    );

    expect(verifiedNode?.confidence).toBe('verified');
    expect(verifiedNode?.content).not.toContain('DG-OS is intended to invoke');
    expect(privateDirectRelationship?.confidence).toBe('self-reported');
    expect(interpretiveRelationship?.confidence).toBe('inferred');
    expect(interpretiveRelationship?.content).toContain(
      'AI Skills Platform (system-ai-skills) supports DG-OS (system-dg-os).'
    );
  });

  it('rejects identity mismatches, embedded paths, dangling relationships, and unsafe paths', () => {
    const profiles = createPublicProfileRegistry([
      dessiProfileProjection,
      profileProjectionV1Fixture,
    ]);
    expect(() =>
      createPublicNetworkModuleRegistry(
        [{ ...networkModuleV1Fixture, profileId: dessiProfileProjection.profileId }],
        profiles
      )
    ).toThrow('Public Network identity does not match profile');

    const unsafe = {
      ...networkModuleV1Fixture,
      nodes: [
        {
          ...networkModuleV1Fixture.nodes[0],
          boundary: 'Draft stored at /Users/fixture/private/network.md.',
          evidenceVisibility: 'secret',
        },
        networkModuleV1Fixture.nodes[1],
      ],
      relationships: [
        {
          ...networkModuleV1Fixture.relationships[0],
          to: 'missing-node',
          evidence: '',
        },
      ],
      paths: [
        {
          ...networkModuleV1Fixture.paths[0],
          relationshipIds: ['missing-relationship'],
        },
      ],
    } as unknown as PublicNetworkModule;
    const issues = validatePublicNetworkModule(unsafe);

    expect(issues.some((issue) => issue.message.includes('local filesystem paths'))).toBe(true);
    expect(issues.some((issue) => issue.message === 'Unsupported evidence visibility.')).toBe(true);
    expect(issues.some((issue) => issue.message === 'Unknown target node: missing-node.')).toBe(
      true
    );
    expect(issues.some((issue) => issue.message === 'Relationship provenance is required.')).toBe(
      true
    );
    expect(
      issues.some((issue) => issue.message === 'Unknown path relationship: missing-relationship.')
    ).toBe(true);
  });
});
