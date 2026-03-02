import { copyFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const sourceMarkdown = path.resolve(repoRoot, 'src/data/resume/cv.md');
const publicDir = path.resolve(repoRoot, 'public/cv');
const targetMarkdown = path.resolve(publicDir, 'Dessi_Georgieva_CV.md');
const requiredArtifacts = [
  path.resolve(publicDir, 'Dessi_Georgieva_CV.pdf'),
  path.resolve(publicDir, 'Dessi_Georgieva_CV.docx'),
];

const ensureExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const run = async () => {
  await mkdir(publicDir, { recursive: true });
  await copyFile(sourceMarkdown, targetMarkdown);
  console.log(`Synced markdown: ${targetMarkdown}`);

  for (const artifact of requiredArtifacts) {
    const exists = await ensureExists(artifact);
    if (!exists) {
      console.warn(`Missing artifact: ${artifact}`);
      console.warn('Add the file or regenerate it before release.');
    }
  }
};

run().catch((error) => {
  console.error('Failed to sync resume assets:', error);
  process.exit(1);
});
