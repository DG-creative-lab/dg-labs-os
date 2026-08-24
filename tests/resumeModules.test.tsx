import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ResumeApp from '../src/components/global/ResumeApp';
import { profileModulesV1Fixture } from './fixtures/contracts/profileModulesV1';
import { profileProjectionV1Fixture } from './fixtures/contracts/profileProjectionV1';
import { resumeModuleV1Fixture } from './fixtures/contracts/resumeModuleV1';
import { createPublicProfileRegistry } from '../src/profiles';
import { createPublicProfileModuleRegistry } from '../src/profiles/modules';
import {
  buildResumeViewModel,
  createPublicResumeModuleRegistry,
  dessiResumeModule,
  renderResumeMarkdown,
  validatePublicResumeModule,
  type PublicResumeModule,
} from '../src/profiles/resume';

describe('public Resume modules', () => {
  it('keeps the published Dessi and fixture Resume modules valid and serialisable', () => {
    expect(validatePublicResumeModule(dessiResumeModule)).toEqual([]);
    expect(validatePublicResumeModule(resumeModuleV1Fixture)).toEqual([]);
    expect(JSON.parse(JSON.stringify(resumeModuleV1Fixture))).toEqual(resumeModuleV1Fixture);
    expect(dessiResumeModule.publication).toEqual({
      approvedBy: 'owner',
      reviewedAt: '2026-08-23T00:00:00Z',
      publishedAt: '2026-08-23T00:00:00Z',
      privateSourcesExcluded: true,
      sourcePolicy:
        'Resume v5 includes only owner-reviewed public Profile, Workbench, and Evidence records selected in this module. Private and employer-confidential source material is excluded.',
    });
  });

  it('resolves and renders a second profile without inheriting Dessi content', () => {
    const profiles = createPublicProfileRegistry([profileProjectionV1Fixture]);
    const modules = createPublicProfileModuleRegistry([profileModulesV1Fixture], profiles);
    const resumes = createPublicResumeModuleRegistry([resumeModuleV1Fixture], profiles, modules);
    const profile = profiles.resolve('contract-fixture');
    const resume = buildResumeViewModel(
      profile,
      modules.resolve(profile.handle),
      resumes.resolve(profile.handle)
    );
    const markdown = renderResumeMarkdown(resume);
    const html = renderToStaticMarkup(
      <ResumeApp profile={profile} cv={profile.cv.primary} resume={resume} />
    );

    expect(markdown).toContain('# Contract Fixture');
    expect(markdown).toContain('### Contract System');
    expect(markdown).toContain('The v1 contract fixture is accepted by the current validator.');
    expect(markdown).not.toContain('Dessi');
    expect(html).toContain('Contract Fixture');
    expect(html).toContain('/cv/Contract_Fixture_CV.pdf');
    expect(html).not.toContain('Dessi Georgieva');
  });

  it('rejects private paths and dangling profile, system, claim, highlight, and link references', () => {
    const profiles = createPublicProfileRegistry([profileProjectionV1Fixture]);
    const modules = createPublicProfileModuleRegistry([profileModulesV1Fixture], profiles);
    const unsafe = {
      ...resumeModuleV1Fixture,
      summary: 'Draft stored at /Users/name/private.md',
      contact: [{ kind: 'profile-link', linkId: 'missing-link' }],
      selectedSystems: [
        {
          ...resumeModuleV1Fixture.selectedSystems[0],
          workbenchItemId: 'missing-system',
          evidenceClaimIds: ['missing-claim'],
          workbenchHighlightIndexes: [99],
        },
      ],
    } as PublicResumeModule;

    expect(
      validatePublicResumeModule(unsafe).some((issue) =>
        issue.message.includes('local filesystem paths')
      )
    ).toBe(true);
    expect(() => createPublicResumeModuleRegistry([unsafe], profiles, modules)).toThrow(
      /Unknown profile link|Unknown Workbench item|Unknown evidence claim/
    );
  });

  it('rejects unknown contact discriminators before a Resume can be registered', () => {
    const profiles = createPublicProfileRegistry([profileProjectionV1Fixture]);
    const modules = createPublicProfileModuleRegistry([profileModulesV1Fixture], profiles);
    const unknownContact = {
      ...resumeModuleV1Fixture,
      contact: [{ kind: 'telephone', value: '+44 0000 000000' }],
    } as unknown as PublicResumeModule;

    expect(validatePublicResumeModule(unknownContact)).toContainEqual({
      path: 'contact[0].kind',
      message: 'Unsupported Resume contact kind.',
    });
    expect(() => createPublicResumeModuleRegistry([unknownContact], profiles, modules)).toThrow(
      'contact[0].kind: Unsupported Resume contact kind.'
    );
  });

  it('renders identical Markdown for identical approved inputs', () => {
    const profiles = createPublicProfileRegistry([profileProjectionV1Fixture]);
    const modules = createPublicProfileModuleRegistry([profileModulesV1Fixture], profiles);
    const profile = profiles.resolve('contract-fixture');
    const first = buildResumeViewModel(
      profile,
      modules.resolve(profile.handle),
      resumeModuleV1Fixture
    );
    const second = buildResumeViewModel(
      profile,
      modules.resolve(profile.handle),
      resumeModuleV1Fixture
    );

    expect(renderResumeMarkdown(first)).toBe(renderResumeMarkdown(second));
  });
});
