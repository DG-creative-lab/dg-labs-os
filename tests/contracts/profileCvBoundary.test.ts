import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
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
      source: { kind: 'profile-resume' } | { kind: 'markdown'; path: string };
      publicStem: string;
    }>;
    documentMetadata: {
      displayName: string;
      subject: string;
      keywords: string[];
      language: string;
    };
  }>;
};

const repoRoot = fileURLToPath(new URL('../../', import.meta.url));
const buildScript = path.join(repoRoot, 'scripts/resume/build-profile-cv.mjs');
const rendererScript = path.join(repoRoot, 'scripts/resume/build-application-cvs.py');
const fakeRenderer = path.join(repoRoot, 'tests/fixtures/fakeCvRenderer.mjs');
const ciWorkflow = readFileSync(path.join(repoRoot, '.github/workflows/ci.yml'), 'utf8');
const resumeRequirements = readFileSync(
  path.join(repoRoot, 'scripts/resume/requirements.txt'),
  'utf8'
);
const manifest = JSON.parse(
  readFileSync(path.join(repoRoot, 'scripts/resume/cv-build-manifest.json'), 'utf8')
) as CvBuildManifest;
const buildArgs = (...args: string[]) => ['--import', 'tsx', buildScript, ...args];

describe('profile CV boundary', () => {
  it('installs the complete fail-closed renderer toolchain in CI', () => {
    expect(resumeRequirements).toMatch(/^python-docx==\d+\.\d+\.\d+$/m);
    expect(ciWorkflow).toContain('cache-dependency-path: scripts/resume/requirements.txt');
    expect(ciWorkflow).toContain(
      'python -m pip install --requirement scripts/resume/requirements.txt'
    );
    expect(ciWorkflow).toContain(
      'sudo apt-get install --yes --no-install-recommends libreoffice-writer'
    );
    expect(ciWorkflow).toContain('run: pnpm resume:build');
    expect(ciWorkflow).not.toContain('command -v pandoc');
  });

  it('keeps build-only sources aligned with approved public CV assets', () => {
    expect(manifest.schemaVersion).toBe('dg-os.cv-build-manifest/v2');
    const dessiBuildProfile = manifest.profiles.find((profile) => profile.handle === 'dessi');
    expect(dessiBuildProfile).toBeDefined();
    expect(dessiBuildProfile?.documentMetadata).toMatchObject({
      displayName: 'Dessi Georgieva',
      language: 'en-GB',
    });

    for (const target of dessiBuildProfile?.variants ?? []) {
      const resolved = resolvePublicProfileCv('dessi', target.id);
      expect(dessiBuildProfile?.documentMetadata.displayName).toBe(
        resolved.profile.identity.displayName
      );
      expect(resolved.cv.files).toEqual({
        pdf: `/cv/${target.publicStem}.pdf`,
        docx: `/cv/${target.publicStem}.docx`,
        markdown: `/cv/${target.publicStem}.md`,
      });
    }

    expect(dessiBuildProfile?.variants.find((target) => target.id === 'general')?.source).toEqual({
      kind: 'profile-resume',
    });
    expect(
      dessiBuildProfile?.variants.find((target) => target.id === 'openai-codex')?.source
    ).toEqual({
      kind: 'markdown',
      path: 'src/data/resume/openai-codex-cv.md',
    });

    expect(JSON.stringify(resolvePublicProfileCv('dessi', 'general'))).not.toContain(
      'src/data/resume'
    );
    expect(readFileSync(rendererScript, 'utf8')).not.toContain('Dessi Georgieva');
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
      buildArgs('--profile', 'dessi', '--variant', 'general', '--dry-run'),
      { cwd: repoRoot, encoding: 'utf8' }
    );
    expect(valid.status).toBe(0);
    expect(JSON.parse(valid.stdout)[0]).toMatchObject({
      profileHandle: 'dessi',
      id: 'general',
      documentMetadata: { displayName: 'Dessi Georgieva', language: 'en-GB' },
      source: { kind: 'profile-resume' },
      publicFiles: { pdf: '/cv/Dessi_Georgieva_CV.pdf' },
    });

    const missingSelection = spawnSync(process.execPath, buildArgs('--dry-run'), {
      cwd: repoRoot,
      encoding: 'utf8',
    });
    expect(missingSelection.status).toBe(1);
    expect(missingSelection.stderr).toContain('Usage: pnpm cv:build');

    const unknownProfile = spawnSync(
      process.execPath,
      buildArgs('--profile', 'unknown', '--variant', 'general', '--dry-run'),
      { cwd: repoRoot, encoding: 'utf8' }
    );
    expect(unknownProfile.status).toBe(1);
    expect(unknownProfile.stderr).toContain('CV build profile not found: unknown');
  });

  it('publishes all formats only after a fresh PDF is staged', () => {
    const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'dg-os-cv-test-'));
    const outputDirectory = path.join(temporaryRoot, 'public-cv');
    const metadataPath = path.join(temporaryRoot, 'metadata.json');
    const sourceCapturePath = path.join(temporaryRoot, 'source.md');
    mkdirSync(outputDirectory, { recursive: true });
    const existingPdf = path.join(outputDirectory, 'Dessi_Georgieva_CV.pdf');
    const existingDocx = path.join(outputDirectory, 'Dessi_Georgieva_CV.docx');
    const existingMarkdown = path.join(outputDirectory, 'Dessi_Georgieva_CV.md');
    writeFileSync(existingPdf, 'existing reviewed pdf');
    writeFileSync(existingDocx, 'existing reviewed docx');
    writeFileSync(existingMarkdown, 'existing reviewed markdown');

    try {
      const missingPdf = spawnSync(
        process.execPath,
        buildArgs('--profile', 'dessi', '--variant', 'general'),
        {
          cwd: repoRoot,
          encoding: 'utf8',
          env: {
            ...process.env,
            CV_BUILD_OUTPUT_DIR: outputDirectory,
            CV_RENDERER_COMMAND: process.execPath,
            CV_RENDERER_PATH: fakeRenderer,
            CV_FAKE_RENDERER_MODE: 'missing-pdf',
          },
        }
      );
      expect(missingPdf.status).toBe(1);
      expect(missingPdf.stderr).toContain('did not produce a fresh PDF');
      expect(readFileSync(existingPdf, 'utf8')).toBe('existing reviewed pdf');
      expect(readFileSync(existingDocx, 'utf8')).toBe('existing reviewed docx');
      expect(readFileSync(existingMarkdown, 'utf8')).toBe('existing reviewed markdown');

      const completeBuild = spawnSync(
        process.execPath,
        buildArgs('--profile', 'dessi', '--variant', 'general'),
        {
          cwd: repoRoot,
          encoding: 'utf8',
          env: {
            ...process.env,
            CV_BUILD_OUTPUT_DIR: outputDirectory,
            CV_RENDERER_COMMAND: process.execPath,
            CV_RENDERER_PATH: fakeRenderer,
            CV_FAKE_METADATA_PATH: metadataPath,
            CV_FAKE_SOURCE_CAPTURE_PATH: sourceCapturePath,
          },
        }
      );
      expect(completeBuild.status).toBe(0);
      expect(readFileSync(existingPdf, 'utf8')).toBe('fresh pdf');
      expect(readFileSync(existingDocx, 'utf8')).toBe('fresh docx');
      expect(readFileSync(existingMarkdown, 'utf8')).toBe('fresh markdown');
      expect(JSON.parse(readFileSync(metadataPath, 'utf8'))).toEqual({
        displayName: 'Dessi Georgieva',
        subject: 'AI systems engineering resume',
        language: 'en-GB',
        keywords: ['AI systems', 'agents', 'evaluation', 'Python', 'FastAPI', 'TypeScript'],
      });
      expect(readFileSync(sourceCapturePath, 'utf8')).toContain('# Dessi Georgieva');
      expect(readFileSync(sourceCapturePath, 'utf8')).toContain('Agentic Commerce Learning Loop');
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it('fails the drift check when committed general Markdown differs from approved profile data', () => {
    const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'dg-os-cv-drift-'));
    const outputDirectory = path.join(temporaryRoot, 'public-cv');
    mkdirSync(outputDirectory, { recursive: true });
    writeFileSync(path.join(outputDirectory, 'Dessi_Georgieva_CV.md'), 'stale resume');

    try {
      const stale = spawnSync(
        process.execPath,
        buildArgs('--profile', 'dessi', '--variant', 'general', '--check'),
        {
          cwd: repoRoot,
          encoding: 'utf8',
          env: { ...process.env, CV_BUILD_OUTPUT_DIR: outputDirectory },
        }
      );
      expect(stale.status).toBe(1);
      expect(stale.stderr).toContain('Generated CV Markdown is out of date');
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });
});
