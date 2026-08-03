import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadCvBuildManifest,
  parseCvTargetArgs,
  resolveCvBuildTargets,
} from './build-profile-cv.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const publicDir = path.resolve(repoRoot, 'public/cv');

const ensureExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const run = async () => {
  const { profileHandle, variantId } = parseCvTargetArgs(process.argv.slice(2));
  const manifest = await loadCvBuildManifest();
  const resumes = resolveCvBuildTargets(manifest, profileHandle, variantId);
  await mkdir(publicDir, { recursive: true });
  for (const resume of resumes) {
    const targetMarkdown = path.resolve(publicDir, `${resume.publicStem}.md`);
    await copyFile(resume.sourcePath, targetMarkdown);
    console.log(`Synced markdown: ${targetMarkdown}`);

    for (const extension of ['pdf', 'docx']) {
      const artifact = path.resolve(publicDir, `${resume.publicStem}.${extension}`);
      const exists = await ensureExists(artifact);
      if (!exists) {
        console.warn(`Missing artifact: ${artifact}`);
        console.warn('Add the file or regenerate it before release.');
      }
    }
  }
};

run().catch((error) => {
  console.error('Failed to sync resume assets:', error);
  process.exit(1);
});
