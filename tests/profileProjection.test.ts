import { describe, expect, it } from 'vitest';
import { openAiCodexApplication, systemsEvidenceProfile } from '../src/config/applicationProfile';
import { resume } from '../src/config/apps';
import { contact } from '../src/config/contact';
import { publicLinks } from '../src/config/links';
import { personal } from '../src/config/personal';
import { seo } from '../src/config/site';
import { social } from '../src/config/social';
import {
  activeProfile,
  createActiveProfileRuntime,
  createPublicProfileRegistry,
  dessiProfileProjection,
  getPublicProfileCanonicalUrl,
  getPublicProfilePath,
  resolveActiveProfile,
  type ProfileProjection,
  validateProfileProjection,
} from '../src/profiles';

describe('profile projection', () => {
  it('publishes Dessi through a valid, serialisable v1 projection', () => {
    expect(validateProfileProjection(dessiProfileProjection)).toEqual([]);
    expect(JSON.parse(JSON.stringify(dessiProfileProjection))).toEqual(dessiProfileProjection);
  });

  it('resolves a serialisable active runtime with derived display copy', () => {
    expect(resolveActiveProfile('dessi')).toEqual(activeProfile);
    expect(activeProfile.identity.preferredName).toBe('Dessi');
    expect(activeProfile.identity.possessiveName).toBe("Dessi's");
    expect(JSON.parse(JSON.stringify(activeProfile))).toEqual(activeProfile);
  });

  it('does not activate unknown or unpublished profiles', () => {
    expect(() => resolveActiveProfile('unknown')).toThrow('Published profile not found');
    expect(() =>
      createActiveProfileRuntime({
        ...dessiProfileProjection,
        status: 'draft',
      })
    ).toThrow('Cannot activate profile with status: draft');
  });

  it('creates isolated runtime identity without mutating the Dessi fixture', () => {
    const alternateRuntime = createActiveProfileRuntime({
      ...dessiProfileProjection,
      profileId: 'fixture_person',
      handle: 'fixture-person',
      identity: {
        ...dessiProfileProjection.identity,
        displayName: 'Fixture Person',
        preferredName: 'Fixture',
        ownerName: 'Fixture Person',
      },
    });

    expect(alternateRuntime.identity).toMatchObject({
      displayName: 'Fixture Person',
      preferredName: 'Fixture',
      possessiveName: "Fixture's",
    });
    expect(activeProfile.identity.displayName).toBe('Dessi Georgieva');
  });

  it('resolves multiple published fixtures without crossing their identities', () => {
    const fixtureProjection = {
      ...dessiProfileProjection,
      profileId: 'fixture_person',
      handle: 'fixture-person',
      identity: {
        ...dessiProfileProjection.identity,
        displayName: 'Fixture Person',
        preferredName: 'Fixture',
        ownerName: 'Fixture Person',
      },
    } as const;
    const registry = createPublicProfileRegistry([dessiProfileProjection, fixtureProjection]);

    expect(registry.list().map((profile) => profile.handle)).toEqual(['dessi', 'fixture-person']);
    expect(registry.resolve('dessi').identity.displayName).toBe('Dessi Georgieva');
    expect(registry.resolve('fixture-person').identity.displayName).toBe('Fixture Person');
    expect(registry.find('missing')).toBeUndefined();
  });

  it('rejects duplicate handles and builds canonical profile addresses', () => {
    expect(() =>
      createPublicProfileRegistry([dessiProfileProjection, dessiProfileProjection])
    ).toThrow('Duplicate published profile handle: dessi');
    expect(getPublicProfilePath(activeProfile)).toBe('/@dessi');
    expect(getPublicProfileCanonicalUrl(activeProfile)).toBe('https://dg-os.com/@dessi');
  });

  it('is the canonical source for identity, links, general CV, SEO, and systems evidence', () => {
    expect(personal).toMatchObject({
      name: dessiProfileProjection.identity.displayName,
      ownerName: dessiProfileProjection.identity.ownerName,
      role: dessiProfileProjection.identity.role,
      location: dessiProfileProjection.identity.location,
      email: dessiProfileProjection.contact.publicEmail,
      website: dessiProfileProjection.contact.website,
    });
    expect(contact.email).toBe(dessiProfileProjection.contact.publicEmail);
    expect(social.github).toBe(
      dessiProfileProjection.links.find((link) => link.id === 'github-personal')?.url
    );
    expect(social.linkedin).toBe(
      dessiProfileProjection.links.find((link) => link.id === 'linkedin')?.url
    );
    expect(resume).toEqual(dessiProfileProjection.cv.primary.files);
    expect(JSON.stringify(activeProfile)).not.toContain('sourcePath');
    expect(JSON.stringify(activeProfile)).not.toContain('/src/');
    expect(seo).toBe(dessiProfileProjection.seo);
    expect(publicLinks).toHaveLength(dessiProfileProjection.links.length);
    expect(systemsEvidenceProfile).toMatchObject({
      role: dessiProfileProjection.identity.role,
      location: dessiProfileProjection.identity.location,
      heading: dessiProfileProjection.identity.headline,
      introduction: dessiProfileProjection.identity.introduction,
    });
  });

  it('keeps the OpenAI application as an explicit profile variant', () => {
    expect(openAiCodexApplication.role).toBe('Applied AI Engineer, Codex Core Agent');
    expect(openAiCodexApplication.profileHandle).toBe('dessi');
    expect(openAiCodexApplication.cvVariantId).toBe('openai-codex');
    expect(openAiCodexApplication.applicationCv.pdf).toContain('OpenAI_Codex');
    expect(dessiProfileProjection.cv.variants).toContainEqual(
      expect.objectContaining({ id: 'openai-codex' })
    );
    expect(dessiProfileProjection.cv.primary.files.pdf).not.toContain('OpenAI_Codex');
  });

  it('rejects local paths, secret-bearing fields, and duplicate links', () => {
    const unsafeProjection = {
      ...dessiProfileProjection,
      contact: {
        ...dessiProfileProjection.contact,
        website: 'file:///Users/dessi/private-profile.html',
      },
      links: [dessiProfileProjection.links[0], dessiProfileProjection.links[0]],
      metadata: {
        accessToken: 'must-not-be-published',
        internalSource: '/src/data/resume/cv.md',
      },
    } as unknown as ProfileProjection;

    const issues = validateProfileProjection(unsafeProjection);

    expect(issues.some((issue) => issue.path === 'contact.website')).toBe(true);
    expect(issues.some((issue) => issue.message.includes('local filesystem paths'))).toBe(true);
    expect(issues.some((issue) => issue.path === 'metadata.accessToken')).toBe(true);
    expect(issues.some((issue) => issue.path === 'metadata.internalSource')).toBe(true);
    expect(issues.some((issue) => issue.message === 'Link IDs must be unique.')).toBe(true);
  });

  it('rejects local paths embedded inside public profile prose', () => {
    const privateIntroductions = [
      'Draft stored at /Users/name/private.md before review.',
      'Prepared from file:///home/name/private.md before publication.',
      'Draft stored at C:\\Users\\name\\private.md before publication.',
    ];

    for (const introduction of privateIntroductions) {
      const issues = validateProfileProjection({
        ...dessiProfileProjection,
        identity: { ...dessiProfileProjection.identity, introduction },
      });
      expect(issues).toContainEqual({
        path: 'identity.introduction',
        message: 'Public projections cannot contain local filesystem paths.',
      });
    }
  });
});
