import { describe, expect, it } from 'vitest';
import projectionFixtureJson from '../fixtures/contracts/profile-projection-v1.json';
import modulesFixtureJson from '../fixtures/contracts/profile-modules-v1.json';
import { searchKnowledgeEntries } from '../../src/knowledge';
import { buildProfileModuleKnowledgeEntries } from '../../src/profiles/agentEvidence';
import { createPublicProfileRegistry, type ProfileProjection } from '../../src/profiles';
import {
  createPublicProfileModuleRegistry,
  type PublicProfileModules,
} from '../../src/profiles/modules';

const projectionFixture = projectionFixtureJson as unknown as ProfileProjection;
const modulesFixture = modulesFixtureJson as unknown as PublicProfileModules;

describe('public profile interaction boundary', () => {
  it('preserves identity from profile resolution through agent retrieval', () => {
    const profiles = createPublicProfileRegistry([projectionFixture]);
    const modules = createPublicProfileModuleRegistry([modulesFixture], profiles);
    const selectedProfile = profiles.resolve('contract-fixture');
    const selectedModules = modules.resolve(selectedProfile.handle);
    const knowledge = buildProfileModuleKnowledgeEntries(selectedModules);
    const caseStudy = searchKnowledgeEntries(
      knowledge,
      'schema changes compatibility intervention result limitation',
      5
    );
    const boundary = searchKnowledgeEntries(knowledge, 'synthetic real person boundary', 5);

    expect(selectedProfile.profileId).toBe(selectedModules.profileId);
    expect(caseStudy[0]?.id).toBe('module-case-study-fixture-study');
    expect(boundary.some((entry) => entry.id === 'module-boundary-01')).toBe(true);
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
