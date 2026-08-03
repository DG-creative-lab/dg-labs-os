import { createHash } from 'node:crypto';
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveActiveProfile } from '../../src/profiles/runtime.ts';
import { resolvePublicProfileModules } from '../../src/profiles/modules/runtime.ts';
import { renderResumeMarkdown } from '../../src/profiles/resume/markdown.ts';
import { resolvePublicResumeModule } from '../../src/profiles/resume/runtime.ts';
import { buildResumeViewModel } from '../../src/profiles/resume/viewModel.ts';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '..', '..');
const manifestPath = path.resolve(scriptDirectory, 'cv-build-manifest.json');
const rendererPath = path.resolve(scriptDirectory, 'build-application-cvs.py');
const defaultPublicOutputDirectory = path.resolve(repoRoot, 'public', 'cv');
const publicOutputDirectory = process.env.CV_BUILD_OUTPUT_DIR
  ? path.resolve(process.env.CV_BUILD_OUTPUT_DIR)
  : defaultPublicOutputDirectory;
const artifactManifestPath = process.env.CV_ARTIFACT_MANIFEST_PATH
  ? path.resolve(process.env.CV_ARTIFACT_MANIFEST_PATH)
  : publicOutputDirectory === defaultPublicOutputDirectory
    ? path.resolve(scriptDirectory, 'cv-artifact-manifest.json')
    : path.resolve(publicOutputDirectory, 'cv-artifact-manifest.json');
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const PUBLIC_STEM_PATTERN = /^[A-Za-z0-9_-]+$/;
const ARTIFACT_MANIFEST_VERSION = 'dg-os.cv-artifacts/v1';
const ARTIFACT_EXTENSIONS = ['md', 'docx', 'pdf'];

export async function loadCvBuildManifest() {
  return JSON.parse(await readFile(manifestPath, 'utf8'));
}

export function resolveCvBuildTargets(manifest, profileHandle, variantId) {
  if (
    !['dg-os.cv-build-manifest/v1', 'dg-os.cv-build-manifest/v2'].includes(manifest.schemaVersion)
  ) {
    throw new Error(`Unsupported CV build manifest: ${manifest.schemaVersion ?? 'missing'}`);
  }
  if (!HANDLE_PATTERN.test(profileHandle)) {
    throw new Error(`Invalid profile handle: ${profileHandle}`);
  }
  if (variantId !== 'all' && !ID_PATTERN.test(variantId)) {
    throw new Error(`Invalid CV variant: ${variantId}`);
  }

  const profile = manifest.profiles.find((candidate) => candidate.handle === profileHandle);
  if (!profile) throw new Error(`CV build profile not found: ${profileHandle}`);

  const metadata = profile.documentMetadata;
  if (
    !metadata ||
    typeof metadata.displayName !== 'string' ||
    !metadata.displayName.trim() ||
    typeof metadata.subject !== 'string' ||
    !metadata.subject.trim() ||
    !Array.isArray(metadata.keywords) ||
    !metadata.keywords.length ||
    metadata.keywords.some((keyword) => typeof keyword !== 'string' || !keyword.trim()) ||
    typeof metadata.language !== 'string' ||
    !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(metadata.language)
  ) {
    throw new Error(`Invalid document metadata for CV build profile: ${profileHandle}`);
  }

  const targets =
    variantId === 'all'
      ? profile.variants
      : profile.variants.filter((candidate) => candidate.id === variantId);
  if (!targets.length) {
    throw new Error(`CV build variant not found for @${profileHandle}: ${variantId}`);
  }

  return targets.map((target) => {
    if (!ID_PATTERN.test(target.id)) throw new Error(`Invalid manifest CV ID: ${target.id}`);
    if (!PUBLIC_STEM_PATTERN.test(target.publicStem)) {
      throw new Error(`Invalid public CV stem: ${target.publicStem}`);
    }
    const source =
      manifest.schemaVersion === 'dg-os.cv-build-manifest/v1'
        ? { kind: 'markdown', path: target.source }
        : target.source;
    if (
      !source ||
      (source.kind !== 'profile-resume' && source.kind !== 'markdown') ||
      (source.kind === 'markdown' && typeof source.path !== 'string')
    ) {
      throw new Error(`Invalid CV source for @${profileHandle}/${target.id}`);
    }
    const sourcePath = source.kind === 'markdown' ? path.resolve(repoRoot, source.path) : undefined;
    if (sourcePath) {
      const relativeSource = path.relative(repoRoot, sourcePath);
      if (relativeSource.startsWith('..') || path.isAbsolute(relativeSource)) {
        throw new Error(`CV source escapes the repository: ${source.path}`);
      }
    }

    return {
      ...target,
      source,
      profileHandle,
      documentMetadata: metadata,
      sourcePath,
      publicFiles: {
        pdf: `/cv/${target.publicStem}.pdf`,
        docx: `/cv/${target.publicStem}.docx`,
        markdown: `/cv/${target.publicStem}.md`,
      },
    };
  });
}

export function parseCvTargetArgs(args) {
  const valueFor = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const profileHandle = valueFor('--profile');
  const variantId = valueFor('--variant');
  if (!profileHandle || !variantId) {
    throw new Error('Usage: pnpm cv:build --profile <handle> --variant <id|all> [--dry-run]');
  }
  return {
    profileHandle,
    variantId,
    dryRun: args.includes('--dry-run'),
    check: args.includes('--check'),
  };
}

function resolveApprovedProfileResume(profileHandle) {
  const profile = resolveActiveProfile(profileHandle);
  const modules = resolvePublicProfileModules(profileHandle);
  const resume = resolvePublicResumeModule(profileHandle);
  return {
    markdown: renderResumeMarkdown(buildResumeViewModel(profile, modules, resume)),
    approval: {
      projectionVersion: profile.projectionVersion,
      resumeVersion: resume.resumeVersion,
      approvedBy: resume.publication.approvedBy,
      reviewedAt: resume.publication.reviewedAt,
      publishedAt: resume.publication.publishedAt,
      privateSourcesExcluded: resume.publication.privateSourcesExcluded,
      sourcePolicy: resume.publication.sourcePolicy,
    },
  };
}

async function resolveTargetProvenance(target) {
  if (target.source.kind === 'markdown') {
    await access(target.sourcePath);
    return { markdown: await readFile(target.sourcePath, 'utf8'), approval: null };
  }
  return resolveApprovedProfileResume(target.profileHandle);
}

async function resolveTargetSource(target, stagingDirectory, provenance) {
  if (target.source.kind === 'markdown') return target.sourcePath;
  const generatedSource = path.resolve(stagingDirectory, `${target.publicStem}.source.md`);
  await writeFile(generatedSource, provenance.markdown, 'utf8');
  return generatedSource;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
  return sha256(await readFile(filePath));
}

async function loadCvArtifactManifest({ required }) {
  const raw = await readFile(artifactManifestPath, 'utf8').catch((error) => {
    if (!required && error?.code === 'ENOENT') return null;
    throw new Error(`CV artifact manifest is missing: ${artifactManifestPath}`);
  });
  if (raw === null) return { schemaVersion: ARTIFACT_MANIFEST_VERSION, artifacts: [] };

  let artifactManifest;
  try {
    artifactManifest = JSON.parse(raw);
  } catch {
    throw new Error(`CV artifact manifest is not valid JSON: ${artifactManifestPath}`);
  }
  if (
    artifactManifest.schemaVersion !== ARTIFACT_MANIFEST_VERSION ||
    !Array.isArray(artifactManifest.artifacts)
  ) {
    throw new Error(
      `Unsupported CV artifact manifest: ${artifactManifest.schemaVersion ?? 'missing'}`
    );
  }

  const keys = new Set();
  for (const artifact of artifactManifest.artifacts) {
    const key = `${artifact.profileHandle}/${artifact.variantId}`;
    if (keys.has(key)) throw new Error(`Duplicate CV artifact manifest record: ${key}`);
    keys.add(key);
  }
  return artifactManifest;
}

async function createArtifactRecord(target, provenance) {
  return {
    profileHandle: target.profileHandle,
    variantId: target.id,
    publicStem: target.publicStem,
    sourceKind: target.source.kind,
    sourceSha256: sha256(provenance.markdown),
    approval: provenance.approval,
    files: {
      markdown: await sha256File(path.resolve(publicOutputDirectory, `${target.publicStem}.md`)),
      docx: await sha256File(path.resolve(publicOutputDirectory, `${target.publicStem}.docx`)),
      pdf: await sha256File(path.resolve(publicOutputDirectory, `${target.publicStem}.pdf`)),
    },
  };
}

async function writeCvArtifactManifest(records) {
  const artifactManifest = await loadCvArtifactManifest({ required: false });
  const merged = new Map(
    artifactManifest.artifacts.map((artifact) => [
      `${artifact.profileHandle}/${artifact.variantId}`,
      artifact,
    ])
  );
  for (const record of records) {
    merged.set(`${record.profileHandle}/${record.variantId}`, record);
  }
  const nextManifest = {
    schemaVersion: ARTIFACT_MANIFEST_VERSION,
    artifacts: [...merged.values()].sort((left, right) =>
      `${left.profileHandle}/${left.variantId}`.localeCompare(
        `${right.profileHandle}/${right.variantId}`
      )
    ),
  };
  await mkdir(path.dirname(artifactManifestPath), { recursive: true });
  const temporaryManifest = `${artifactManifestPath}.tmp-${process.pid}`;
  await writeFile(temporaryManifest, `${JSON.stringify(nextManifest, null, 2)}\n`, 'utf8');
  await rename(temporaryManifest, artifactManifestPath);
}

async function verifyCvArtifact(target, provenance, artifactManifest) {
  const publicMarkdown = path.resolve(publicOutputDirectory, `${target.publicStem}.md`);
  const actualMarkdown = await readFile(publicMarkdown, 'utf8').catch(() => '');
  if (actualMarkdown !== provenance.markdown) {
    throw new Error(
      `Generated CV Markdown is out of date for @${target.profileHandle}/${target.id}. Run pnpm cv:build --profile ${target.profileHandle} --variant ${target.id}.`
    );
  }

  const record = artifactManifest.artifacts.find(
    (artifact) =>
      artifact.profileHandle === target.profileHandle && artifact.variantId === target.id
  );
  if (!record) {
    throw new Error(
      `CV artifact manifest record is missing for @${target.profileHandle}/${target.id}.`
    );
  }

  const expectedIdentity = {
    profileHandle: target.profileHandle,
    variantId: target.id,
    publicStem: target.publicStem,
    sourceKind: target.source.kind,
    sourceSha256: sha256(provenance.markdown),
    approval: provenance.approval,
  };
  for (const [field, expected] of Object.entries(expectedIdentity)) {
    if (JSON.stringify(record[field]) !== JSON.stringify(expected)) {
      throw new Error(
        `CV artifact manifest ${field} is out of date for @${target.profileHandle}/${target.id}.`
      );
    }
  }

  const current = await createArtifactRecord(target, provenance);
  for (const [format, digest] of Object.entries(current.files)) {
    if (record.files?.[format] !== digest) {
      throw new Error(
        `CV artifact integrity check failed for @${target.profileHandle}/${target.id} ${format.toUpperCase()}.`
      );
    }
  }
}

export async function runCvBuild(args = process.argv.slice(2)) {
  const { profileHandle, variantId, dryRun, check } = parseCvTargetArgs(args);
  const manifest = await loadCvBuildManifest();
  const targets = resolveCvBuildTargets(manifest, profileHandle, variantId);

  if (dryRun) {
    process.stdout.write(
      `${JSON.stringify(
        targets.map(({ sourcePath: _sourcePath, ...target }) => target),
        null,
        2
      )}\n`
    );
    return;
  }

  if (check) {
    const artifactManifest = await loadCvArtifactManifest({ required: true });
    for (const target of targets) {
      const provenance = await resolveTargetProvenance(target);
      await verifyCvArtifact(target, provenance, artifactManifest);
    }
    return;
  }

  await mkdir(publicOutputDirectory, { recursive: true });
  const artifactRecords = [];
  for (const target of targets) {
    const stagingDirectory = await mkdtemp(path.join(tmpdir(), 'dg-os-cv-'));
    try {
      const provenance = await resolveTargetProvenance(target);
      const sourcePath = await resolveTargetSource(target, stagingDirectory, provenance);
      const result = spawnSync(
        process.env.CV_RENDERER_COMMAND || 'python3',
        [
          process.env.CV_RENDERER_PATH || rendererPath,
          '--source',
          sourcePath,
          '--stem',
          target.publicStem,
          '--label',
          target.label,
          '--display-name',
          target.documentMetadata.displayName,
          '--subject',
          target.documentMetadata.subject,
          '--language',
          target.documentMetadata.language,
          '--output-dir',
          stagingDirectory,
          ...target.documentMetadata.keywords.flatMap((keyword) => ['--keyword', keyword]),
        ],
        { cwd: repoRoot, stdio: 'inherit' }
      );
      if (result.status !== 0) {
        throw new Error(`CV renderer failed for @${profileHandle}/${target.id}`);
      }

      for (const extension of ARTIFACT_EXTENSIONS) {
        const stagedArtifact = path.resolve(stagingDirectory, `${target.publicStem}.${extension}`);
        const artifactStats = await stat(stagedArtifact).catch(() => null);
        if (!artifactStats?.isFile() || artifactStats.size === 0) {
          throw new Error(
            `CV renderer did not produce a fresh ${extension.toUpperCase()} for @${profileHandle}/${target.id}`
          );
        }
      }

      for (const extension of ARTIFACT_EXTENSIONS) {
        await copyFile(
          path.resolve(stagingDirectory, `${target.publicStem}.${extension}`),
          path.resolve(publicOutputDirectory, `${target.publicStem}.${extension}`)
        );
      }
      const publishedMarkdown = await readFile(
        path.resolve(publicOutputDirectory, `${target.publicStem}.md`),
        'utf8'
      );
      if (publishedMarkdown !== provenance.markdown) {
        throw new Error(
          `CV renderer changed the selected Markdown source for @${profileHandle}/${target.id}`
        );
      }
      artifactRecords.push(await createArtifactRecord(target, provenance));
    } finally {
      await rm(stagingDirectory, { recursive: true, force: true });
    }
  }
  await writeCvArtifactManifest(artifactRecords);
}

const invokedUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedUrl) {
  runCvBuild().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
