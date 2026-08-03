import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { profileProjectionV1Fixture } from '../fixtures/contracts/profileProjectionV1';
import {
  createPublicProfileRegistry,
  dessiProfileProjection,
  findPublicProfileCv,
  resolvePublicProfileCv,
  type ProfileProjection,
} from '../../src/profiles';

type CvBuildManifest = {
  schemaVersion: string;
  profiles: Array<{
    handle: string;
    variants: Array<{
      id: string;
      source: string;
      publicStem: string;
    }>;
  }>;
};

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const buildScript = path.join(repoRoot, 'scripts/resume/build-profile-cv.mjs');
const manifest = JSON.parse(
  readFileSync(path.join(repoRoot, 'scripts/resume/cv-build-manifest.json'), 'utf8')
) as CvBuildManifest;

describe('profile CV boundary', () => {
  it('keeps build-only sources aligned with approved public CV assets', () => {
    expect(manifest.schemaVersion).toBe('dg-os.cv-build-manifest/v1');
    const dessiBuildProfile = manifest.profiles.find((profile) => profile.handle === 'dessi');
    expect(dessiBuildProfile).toBeDefined();

    for (const target of dessiBuildProfile?.variants ?? []) {
      const resolved = resolvePublicProfileCv('dessi', target.id);
      expect(resolved.cv.files).toEqual({
        pdf: `/cv/${target.publicStem}.pdf`,
        docx: `/cv/${target.publicStem}.docx`,
        markdown: `/cv/${target.publicStem}.md`,
      });
      expect(path.isAbsolute(target.source)).toBe(false);
      expect(target.source.startsWith('src/data/resume/')).toBe(true);
    }

    expect(JSON.stringify(resolvePublicProfileCv('dessi', 'general'))).not.toContain(
      'src/data/resume'
    );
  });

  it('resolves CVs within one profile and never falls back across identities', () => {
    const fixtureProjection = {
      ...profileProjectionV1Fixture,
      cv: {
        ...profileProjectionV1Fixture.cv,
        variants: [
          {
            id: 'openai-codex',
            label: 'Synthetic targeted CV',
            files: {
              pdf: '/cv/Contract_Fixture_Targeted.pdf',
              docx: '/cv/Contract_Fixture_Targeted.docx',
              markdown: '/cv/Contract_Fixture_Targeted.md',
            },
          },
        ],
      },
    } as const satisfies ProfileProjection;
    const profiles = createPublicProfileRegistry([dessiProfileProjection, fixtureProjection]);

    expect(resolvePublicProfileCv('contract-fixture', 'openai-codex', profiles).cv.files.pdf).toBe(
      '/cv/Contract_Fixture_Targeted.pdf'
    );
    expect(resolvePublicProfileCv('dessi', 'openai-codex', profiles).cv.files.pdf).toBe(
      '/cv/Dessi_Georgieva_OpenAI_Codex_CV.pdf'
    );
    expect(findPublicProfileCv('contract-fixture', 'missing', profiles)).toBeUndefined();
    expect(() => resolvePublicProfileCv('missing', 'general', profiles)).toThrow(
      'Published profile not found: missing'
    );
    expect(() => resolvePublicProfileCv('contract-fixture', 'missing', profiles)).toThrow(
      'Published CV not found for @contract-fixture: missing'
    );
  });

  it('requires an explicit build profile and variant and rejects unknown selections', () => {
    const valid = spawnSync(
      process.execPath,
      [buildScript, '--profile', 'dessi', '--variant', 'general', '--dry-run'],
      { cwd: repoRoot, encoding: 'utf8' }
    );
    expect(valid.status).toBe(0);
    expect(JSON.parse(valid.stdout)[0]).toMatchObject({
      profileHandle: 'dessi',
      id: 'general',
      publicFiles: { pdf: '/cv/Dessi_Georgieva_CV.pdf' },
    });

    const missingSelection = spawnSync(process.execPath, [buildScript, '--dry-run'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    expect(missingSelection.status).toBe(1);
    expect(missingSelection.stderr).toContain('Usage: pnpm cv:build');

    const unknownProfile = spawnSync(
      process.execPath,
      [buildScript, '--profile', 'unknown', '--variant', 'general', '--dry-run'],
      { cwd: repoRoot, encoding: 'utf8' }
    );
    expect(unknownProfile.status).toBe(1);
    expect(unknownProfile.stderr).toContain('CV build profile not found: unknown');
  });
});
