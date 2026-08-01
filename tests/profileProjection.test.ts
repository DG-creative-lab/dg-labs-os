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
  dessiProfileProjection,
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
    expect(resume).toEqual({
      ...dessiProfileProjection.cv.primary.files,
      sourcePath: dessiProfileProjection.cv.primary.sourcePath,
    });
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
    expect(openAiCodexApplication.applicationCv.pdf).toContain('OpenAI_Codex');
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
      },
    } as unknown as ProfileProjection;

    const issues = validateProfileProjection(unsafeProjection);

    expect(issues.some((issue) => issue.path === 'contact.website')).toBe(true);
    expect(issues.some((issue) => issue.message.includes('local filesystem paths'))).toBe(true);
    expect(issues.some((issue) => issue.path === 'metadata.accessToken')).toBe(true);
    expect(issues.some((issue) => issue.message === 'Link IDs must be unique.')).toBe(true);
  });
});
