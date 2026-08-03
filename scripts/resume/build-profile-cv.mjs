import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '..', '..');
const manifestPath = path.resolve(scriptDirectory, 'cv-build-manifest.json');
const rendererPath = path.resolve(scriptDirectory, 'build-application-cvs.py');
const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const PUBLIC_STEM_PATTERN = /^[A-Za-z0-9_-]+$/;

export async function loadCvBuildManifest() {
  return JSON.parse(await readFile(manifestPath, 'utf8'));
}

export function resolveCvBuildTargets(manifest, profileHandle, variantId) {
  if (manifest.schemaVersion !== 'dg-os.cv-build-manifest/v1') {
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
    const sourcePath = path.resolve(repoRoot, target.source);
    const relativeSource = path.relative(repoRoot, sourcePath);
    if (relativeSource.startsWith('..') || path.isAbsolute(relativeSource)) {
      throw new Error(`CV source escapes the repository: ${target.source}`);
    }

    return {
      ...target,
      profileHandle,
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
  return { profileHandle, variantId, dryRun: args.includes('--dry-run') };
}

export async function runCvBuild(args = process.argv.slice(2)) {
  const { profileHandle, variantId, dryRun } = parseCvTargetArgs(args);
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

  for (const target of targets) {
    await access(target.sourcePath);
    const result = spawnSync(
      'python3',
      [
        rendererPath,
        '--source',
        target.sourcePath,
        '--stem',
        target.publicStem,
        '--label',
        target.label,
      ],
      { cwd: repoRoot, stdio: 'inherit' }
    );
    if (result.status !== 0) {
      throw new Error(`CV renderer failed for @${profileHandle}/${target.id}`);
    }
  }
}

const invokedUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedUrl) {
  runCvBuild().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
