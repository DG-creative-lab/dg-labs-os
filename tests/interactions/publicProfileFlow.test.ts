import { describe, expect, it } from 'vitest';
import { profileModulesV1Fixture as modulesFixture } from '../fixtures/contracts/profileModulesV1';
import { profileProjectionV1Fixture as projectionFixture } from '../fixtures/contracts/profileProjectionV1';
import { writingModuleV1Fixture as writingFixture } from '../fixtures/contracts/writingModuleV1';
import { searchKnowledgeEntries } from '../../src/knowledge';
import {
  buildProfileModuleKnowledgeEntries,
  buildWritingModuleKnowledgeEntries,
} from '../../src/profiles/agentEvidence';
import { createPublicProfileRegistry } from '../../src/profiles';
import { createPublicProfileModuleRegistry } from '../../src/profiles/modules';
import { createPublicWritingModuleRegistry } from '../../src/profiles/writing';

describe('public profile interaction boundary', () => {
  it('preserves identity from profile resolution through agent retrieval', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([modulesFixture], profiles);
    const selectedProfile = profiles.resolve('contract-fixture');
    const selectedModules = modules.resolve(selectedProfile.handle);
    const writing = createPublicWritingModuleRegistry([writingFixture], profiles);
    const selectedWriting = writing.resolve(selectedProfile.handle);
    const knowledge = [
      ...buildProfileModuleKnowledgeEntries(selectedModules),
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
    expect(JSON.stringify(knowledge)).not.toContain('Dessi');
  });

  it('fails closed when a profile has no matching module bundle', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([], profiles);

    expect(() => modules.resolve(profiles.resolve('contract-fixture').handle)).toThrow(
      'Published profile modules not found'
    );
  });
});
