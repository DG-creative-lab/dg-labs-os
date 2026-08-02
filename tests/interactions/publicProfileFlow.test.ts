import { describe, expect, it } from 'vitest';
import { profileModulesV1Fixture as modulesFixture } from '../fixtures/contracts/profileModulesV1';
import { networkModuleV1Fixture as networkFixture } from '../fixtures/contracts/networkModuleV1';
import { profileProjectionV1Fixture as projectionFixture } from '../fixtures/contracts/profileProjectionV1';
import { writingModuleV1Fixture as writingFixture } from '../fixtures/contracts/writingModuleV1';
import { searchKnowledgeEntries } from '../../src/knowledge';
import {
  buildProfileModuleKnowledgeEntries,
  buildNetworkModuleKnowledgeEntries,
  buildWritingModuleKnowledgeEntries,
} from '../../src/profiles/agentEvidence';
import { createPublicProfileRegistry } from '../../src/profiles';
import { createPublicProfileModuleRegistry } from '../../src/profiles/modules';
import { createPublicNetworkModuleRegistry } from '../../src/profiles/network';
import { createPublicWritingModuleRegistry } from '../../src/profiles/writing';
import {
  getAppCloseDestination,
  openWorkbenchSectionFromMenu,
} from '../../src/services/appOpenHandlers';

describe('public profile interaction boundary', () => {
  it('preserves identity from profile resolution through agent retrieval', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([modulesFixture], profiles);
    const selectedProfile = profiles.resolve('contract-fixture');
    const selectedModules = modules.resolve(selectedProfile.handle);
    const networks = createPublicNetworkModuleRegistry([networkFixture], profiles);
    const selectedNetwork = networks.resolve(selectedProfile.handle);
    const writing = createPublicWritingModuleRegistry([writingFixture], profiles);
    const selectedWriting = writing.resolve(selectedProfile.handle);
    const knowledge = [
      ...buildProfileModuleKnowledgeEntries(selectedModules),
      ...buildNetworkModuleKnowledgeEntries(selectedNetwork),
      ...buildWritingModuleKnowledgeEntries(selectedWriting),
    ];
    const caseStudy = searchKnowledgeEntries(
      knowledge,
      'schema changes compatibility intervention result limitation',
      5
    );
    const boundary = searchKnowledgeEntries(knowledge, 'synthetic real person boundary', 5);

    expect(selectedProfile.profileId).toBe(selectedModules.profileId);
    expect(caseStudy[0]?.id).toBe('module-case-study-fixture-study');
    expect(boundary.some((entry) => entry.id === 'module-boundary-01')).toBe(true);
    expect(knowledge.some((entry) => entry.id === 'writing-fixture-writing')).toBe(true);
    expect(knowledge.some((entry) => entry.id === 'network-fixture-system')).toBe(true);
    expect(JSON.stringify(knowledge)).not.toContain('Dessi');
  });

  it('fails closed when a profile has no matching module bundle', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([], profiles);
    const networks = createPublicNetworkModuleRegistry([], profiles);

    expect(() => modules.resolve(profiles.resolve('contract-fixture').handle)).toThrow(
      'Published profile modules not found'
    );
    expect(() => networks.resolve(profiles.resolve('contract-fixture').handle)).toThrow(
      'Published Network module not found'
    );
  });

  it('preserves the selected handle across profile module menu actions', () => {
    const events: Event[] = [];
    const adapter = {
      location: {
        pathname: '/@contract-fixture/network',
        href: '/@contract-fixture/network',
      },
      dispatchEvent: (event: Event) => {
        events.push(event);
        return true;
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      setTimeout: () => 0,
    } as unknown as Window;

    openWorkbenchSectionFromMenu('workbench-selected-systems', adapter);

    expect(events).toHaveLength(0);
    expect(adapter.location.href).toBe('/@contract-fixture/workbench#workbench-selected-systems');
    expect(getAppCloseDestination('/@contract-fixture/network')).toBe('/@contract-fixture');
    expect(adapter.location.href).not.toContain('@dessi');
  });
});
