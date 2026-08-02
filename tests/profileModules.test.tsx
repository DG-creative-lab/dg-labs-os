import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import WorkbenchApp from '../src/components/global/WorkbenchApp';
import EvolutionApp from '../src/components/global/EvolutionApp';
import { searchKnowledgeEntries } from '../src/knowledge';
import { buildProfileModuleKnowledgeEntries } from '../src/profiles/agentEvidence';
import {
  createActiveProfileRuntime,
  createPublicProfileRegistry,
  dessiProfileProjection,
  type ProfileProjection,
} from '../src/profiles';
import {
  createPublicProfileModuleRegistry,
  dessiProfileModules,
  PROFILE_MODULES_SCHEMA_VERSION,
  type PublicProfileModules,
  validatePublicProfileModules,
} from '../src/profiles/modules';

const fixtureProjection = {
  ...dessiProfileProjection,
  profileId: 'fixture_person',
  handle: 'fixture-person',
  identity: {
    ...dessiProfileProjection.identity,
    displayName: 'Fixture Person',
    preferredName: 'Fixture',
    ownerName: 'Fixture Person',
    headline: 'Fixture systems with isolated evidence.',
  },
} as const satisfies ProfileProjection;

const fixtureModules = {
  schemaVersion: PROFILE_MODULES_SCHEMA_VERSION,
  profileId: fixtureProjection.profileId,
  handle: fixtureProjection.handle,
  projectionVersion: fixtureProjection.projectionVersion,
  modulesVersion: 1,
  status: 'published',
  workbench: {
    moduleId: 'workbench',
    moduleVersion: 1,
    categories: ['Fixture Systems'],
    categoryDescriptions: {
      'Fixture Systems': 'Only the fixture profile can publish these systems.',
    },
    items: [
      {
        id: 'fixture-system',
        category: 'Fixture Systems',
        classification: 'Fixture public system',
        title: 'Fixture System',
        subtitle: 'An isolated module-registry test',
        summary: 'This record must never inherit Dessi profile content.',
        stack: ['TypeScript'],
        links: { repo: 'https://example.com/fixture-system' },
        highlights: ['Exercises explicit profile-module selection.'],
      },
    ],
  },
  evidenceEvolution: {
    moduleId: 'evidence-evolution',
    moduleVersion: 1,
    claims: [
      {
        id: 'fixture-claim',
        statement: 'The fixture renders only its registered public modules.',
        confidence: 'verified',
        visibility: 'public',
        lastVerified: '2026-08-02',
        evidence: [
          {
            label: 'Fixture evidence',
            url: 'https://example.com/fixture-evidence',
            kind: 'site',
          },
        ],
      },
    ],
    caseStudies: [
      {
        id: 'fixture-case-study',
        title: 'Fixture Reliability Study',
        classification: 'Synthetic public case study',
        contribution: 'Designed the isolated fixture boundary.',
        problem: 'Profile records could cross identity boundaries.',
        intervention: 'Introduced a registry-scoped module projection.',
        evaluation: 'Rendered and retrieved the second fixture independently.',
        result: 'Fixture-only records remain searchable without Dessi content.',
        limitation: 'This verifies isolation, not production scale.',
        roleSignals: ['evidence boundaries', 'retrieval'],
        evidence: [
          {
            label: 'Fixture case-study evidence',
            url: 'https://example.com/fixture-case-study',
            kind: 'site',
          },
        ],
      },
    ],
    boundaries: ['This is test data, not a published person.'],
    entries: [
      {
        date: '2026-08-02',
        kind: 'experiment',
        title: 'Fixture evolution entry',
        summary: 'The second profile remains isolated from the Dessi module bundle.',
        state: 'active',
        evidenceIds: ['fixture-claim'],
      },
    ],
  },
  publication: {
    approvedBy: 'owner',
    reviewedAt: '2026-08-02T00:00:00Z',
    publishedAt: '2026-08-02T00:00:00Z',
    privateSourcesExcluded: true,
    sourcePolicy: 'Synthetic public test data only.',
  },
} as const satisfies PublicProfileModules;

describe('public profile modules', () => {
  it('publishes Dessi through a valid, serialisable v1 module bundle', () => {
    expect(validatePublicProfileModules(dessiProfileModules)).toEqual([]);
    expect(JSON.parse(JSON.stringify(dessiProfileModules))).toEqual(dessiProfileModules);
  });

  it('resolves two profiles without crossing their content boundaries', () => {
    const profiles = createPublicProfileRegistry([dessiProfileProjection, fixtureProjection]);
    const modules = createPublicProfileModuleRegistry(
      [dessiProfileModules, fixtureModules],
      profiles
    );

    expect(modules.resolve('fixture-person').workbench.items[0].id).toBe('fixture-system');
    expect(JSON.stringify(modules.resolve('fixture-person'))).not.toContain(
      'agentic-commerce-loop'
    );
    expect(JSON.stringify(modules.resolve('dessi'))).not.toContain('fixture-system');
  });

  it('renders shared Workbench and Evolution components from the fixture modules', () => {
    const profile = createActiveProfileRuntime(fixtureProjection);
    const workbenchHtml = renderToStaticMarkup(
      <WorkbenchApp profile={profile} workbench={fixtureModules.workbench} />
    );
    const evolutionHtml = renderToStaticMarkup(
      <EvolutionApp profile={profile} evidenceEvolution={fixtureModules.evidenceEvolution} />
    );

    expect(workbenchHtml).toContain('Fixture System');
    expect(workbenchHtml).not.toContain('Agentic Commerce');
    expect(evolutionHtml).toContain('Fixture evolution entry');
    expect(evolutionHtml).toContain('Fixture');
    expect(evolutionHtml).not.toContain('Dessi Space');
  });

  it('builds Profile Agent knowledge from the selected module bundle only', () => {
    const entries = buildProfileModuleKnowledgeEntries(fixtureModules);
    const expectedEntryCount =
      fixtureModules.workbench.items.length +
      fixtureModules.evidenceEvolution.claims.length +
      fixtureModules.evidenceEvolution.caseStudies.length +
      fixtureModules.evidenceEvolution.boundaries.length +
      fixtureModules.evidenceEvolution.entries.length;

    expect(entries).toHaveLength(expectedEntryCount);
    expect(entries.some((entry) => entry.title === 'Fixture System')).toBe(true);
    expect(entries.some((entry) => entry.title === 'Fixture Reliability Study')).toBe(true);
    expect(entries.some((entry) => entry.id === 'module-boundary-01')).toBe(true);
    expect(entries.some((entry) => entry.title === 'Fixture evolution entry')).toBe(true);
    expect(JSON.stringify(entries)).not.toContain('Agentic Commerce');
  });

  it('retrieves case-study outcomes, limitations, and current boundaries', () => {
    const entries = buildProfileModuleKnowledgeEntries(fixtureModules);
    const caseStudyHits = searchKnowledgeEntries(
      entries,
      'registry scoped intervention production scale limitation',
      5
    );
    const boundaryHits = searchKnowledgeEntries(entries, 'test data published person boundary', 5);

    expect(caseStudyHits[0]?.id).toBe('module-case-study-fixture-case-study');
    expect(caseStudyHits[0]?.content).toContain('Intervention:');
    expect(caseStudyHits[0]?.content).toContain('Result:');
    expect(caseStudyHits[0]?.content).toContain('Limitation:');
    expect(boundaryHits.some((entry) => entry.id === 'module-boundary-01')).toBe(true);
  });

  it('rejects mismatched identities, private paths, and dangling evidence references', () => {
    const profiles = createPublicProfileRegistry([dessiProfileProjection, fixtureProjection]);
    expect(() =>
      createPublicProfileModuleRegistry(
        [{ ...fixtureModules, profileId: dessiProfileProjection.profileId }],
        profiles
      )
    ).toThrow('Profile module identity does not match profile');

    const unsafe = {
      ...fixtureModules,
      workbench: {
        ...fixtureModules.workbench,
        items: [
          {
            ...fixtureModules.workbench.items[0],
            summary: '/Users/fixture/private/source',
          },
        ],
      },
      evidenceEvolution: {
        ...fixtureModules.evidenceEvolution,
        entries: [
          {
            ...fixtureModules.evidenceEvolution.entries[0],
            evidenceIds: ['missing-claim'],
          },
        ],
      },
    } as PublicProfileModules;
    const issues = validatePublicProfileModules(unsafe);

    expect(issues.some((issue) => issue.message.includes('local filesystem paths'))).toBe(true);
    expect(issues.some((issue) => issue.message === 'Unknown evidence id: missing-claim.')).toBe(
      true
    );
  });
});
