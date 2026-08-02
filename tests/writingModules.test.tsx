import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TechnicalWritingApp from '../src/components/global/TechnicalWritingApp';
import { searchKnowledgeEntries } from '../src/knowledge';
import { buildWritingModuleKnowledgeEntries } from '../src/profiles/agentEvidence';
import {
  createActiveProfileRuntime,
  createPublicProfileRegistry,
  dessiProfileProjection,
} from '../src/profiles';
import {
  createPublicWritingModuleRegistry,
  dessiWritingModule,
  type PublicWritingModule,
  validatePublicWritingModule,
} from '../src/profiles/writing';
import { profileProjectionV1Fixture } from './fixtures/contracts/profileProjectionV1';
import { writingModuleV1Fixture } from './fixtures/contracts/writingModuleV1';

describe('public Writing modules', () => {
  it('publishes Dessi through a valid, serialisable v1 Writing module', () => {
    expect(validatePublicWritingModule(dessiWritingModule)).toEqual([]);
    expect(JSON.parse(JSON.stringify(dessiWritingModule))).toEqual(dessiWritingModule);
    expect(dessiWritingModule.entries.every((entry) => entry.status === 'published')).toBe(true);
  });

  it('resolves two profiles without crossing their Writing content', () => {
    const profiles = createPublicProfileRegistry([
      dessiProfileProjection,
      profileProjectionV1Fixture,
    ]);
    const writing = createPublicWritingModuleRegistry(
      [dessiWritingModule, writingModuleV1Fixture],
      profiles
    );

    expect(writing.resolve('contract-fixture').entries[0].title).toBe('Writing Contract Fixture');
    expect(JSON.stringify(writing.resolve('contract-fixture'))).not.toContain(
      'Agentic Commerce Readiness'
    );
    expect(JSON.stringify(writing.resolve('dessi'))).not.toContain('Writing Contract Fixture');
  });

  it('renders the selected profile and Writing module without global Dessi content', () => {
    const profile = createActiveProfileRuntime(profileProjectionV1Fixture);
    const html = renderToStaticMarkup(
      <TechnicalWritingApp profile={profile} writing={writingModuleV1Fixture} />
    );

    expect(html).toContain('Fixture Writing');
    expect(html).toContain('Writing Contract Fixture');
    expect(html).toContain('Fixture Publisher');
    expect(html).toContain('Fixture&#x27;s contribution');
    expect(html).toContain('Synthetic contribution used only for compatibility testing.');
    expect(html).toContain('Verified');
    expect(html).not.toContain('Performics Labs');
  });

  it('renders self-reported contribution confidence for Dessi writing', () => {
    const profile = createActiveProfileRuntime(dessiProfileProjection);
    const html = renderToStaticMarkup(
      <TechnicalWritingApp profile={profile} writing={dessiWritingModule} />
    );

    expect(html).toContain('Dessi&#x27;s contribution');
    expect(html).toContain('Self-reported');
    expect(html).toContain(
      'Professional article selected as evidence of Dessi&#x27;s technical synthesis and design judgement.'
    );
  });

  it('rejects embedded Unix, file URL, and Windows private paths in prose', () => {
    const embeddedPaths = [
      {
        module: {
          ...writingModuleV1Fixture,
          entries: [
            {
              ...writingModuleV1Fixture.entries[0],
              boundary: 'Draft stored at /Users/name/private.md before review.',
            },
          ],
        },
        expectedPath: 'entries[0].boundary',
      },
      {
        module: {
          ...writingModuleV1Fixture,
          entries: [
            {
              ...writingModuleV1Fixture.entries[0],
              authorship: {
                ...writingModuleV1Fixture.entries[0].authorship,
                contribution: 'Prepared from file:///home/name/private.md before publication.',
              },
            },
          ],
        },
        expectedPath: 'entries[0].authorship.contribution',
      },
      {
        module: {
          ...writingModuleV1Fixture,
          archive: {
            ...writingModuleV1Fixture.archive,
            boundary: 'Draft stored at C:\\Users\\name\\private.md before publication.',
          },
        },
        expectedPath: 'archive.boundary',
      },
    ] as const;

    for (const fixture of embeddedPaths) {
      expect(validatePublicWritingModule(fixture.module)).toContainEqual({
        path: fixture.expectedPath,
        message: 'Public writing cannot contain local filesystem paths.',
      });
    }
  });

  it('does not mistake a public URL path for a local source path', () => {
    const publicUrl = {
      ...writingModuleV1Fixture,
      entries: [
        {
          ...writingModuleV1Fixture.entries[0],
          boundary: 'Public reference: https://example.com/src/article.',
        },
      ],
    };

    expect(validatePublicWritingModule(publicUrl)).toEqual([]);
  });

  it('builds bounded Profile Agent evidence from the selected Writing module', () => {
    const entries = buildWritingModuleKnowledgeEntries(writingModuleV1Fixture);
    const hits = searchKnowledgeEntries(entries, 'portable writing contract fixture', 5);

    expect(entries).toHaveLength(1);
    expect(hits[0]?.id).toBe('writing-fixture-writing');
    expect(hits[0]?.content).toContain('Published by: Fixture Publisher.');
    expect(JSON.stringify(entries)).not.toContain('Performics Labs');
  });

  it('rejects identity mismatches, private paths, drafts, and missing canonical evidence', () => {
    const profiles = createPublicProfileRegistry([
      dessiProfileProjection,
      profileProjectionV1Fixture,
    ]);
    expect(() =>
      createPublicWritingModuleRegistry(
        [{ ...writingModuleV1Fixture, profileId: dessiProfileProjection.profileId }],
        profiles
      )
    ).toThrow('Public writing identity does not match profile');

    const unsafe = {
      ...writingModuleV1Fixture,
      entries: [
        {
          ...writingModuleV1Fixture.entries[0],
          kind: 'Research paper',
          status: 'draft',
          reviewedOn: '2026-08-01',
          boundary: '/Users/fixture/private/draft.md',
          authorship: {
            ...writingModuleV1Fixture.entries[0].authorship,
            contributionConfidence: 'inferred',
          },
          evidence: [
            {
              ...writingModuleV1Fixture.entries[0].evidence[0],
              url: 'https://example.com/different-source',
              kind: 'private',
            },
          ],
        },
      ],
    } as unknown as PublicWritingModule;
    const issues = validatePublicWritingModule(unsafe);

    expect(
      issues.some((issue) => issue.message === 'Only published writing can be registered.')
    ).toBe(true);
    expect(issues.some((issue) => issue.message === 'Unsupported Writing kind.')).toBe(true);
    expect(
      issues.some((issue) => issue.message === 'Review date cannot precede publication date.')
    ).toBe(true);
    expect(issues.some((issue) => issue.message === 'Unsupported contribution confidence.')).toBe(
      true
    );
    expect(issues.some((issue) => issue.message === 'Unsupported evidence kind.')).toBe(true);
    expect(issues.some((issue) => issue.message.includes('local filesystem paths'))).toBe(true);
    expect(
      issues.some(
        (issue) => issue.message === 'Published writing must cite its canonical article URL.'
      )
    ).toBe(true);
  });
});
