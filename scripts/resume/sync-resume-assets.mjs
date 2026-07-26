import { copyFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const publicDir = path.resolve(repoRoot, 'public/cv');
const resumes = [
  {
    source: path.resolve(repoRoot, 'src/data/resume/cv.md'),
    stem: 'Dessi_Georgieva_CV',
  },
  {
    source: path.resolve(repoRoot, 'src/data/resume/openai-codex-cv.md'),
    stem: 'Dessi_Georgieva_OpenAI_Codex_CV',
  },
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
  for (const resume of resumes) {
    const targetMarkdown = path.resolve(publicDir, `${resume.stem}.md`);
    await copyFile(resume.source, targetMarkdown);
    console.log(`Synced markdown: ${targetMarkdown}`);

    for (const extension of ['pdf', 'docx']) {
      const artifact = path.resolve(publicDir, `${resume.stem}.${extension}`);
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
