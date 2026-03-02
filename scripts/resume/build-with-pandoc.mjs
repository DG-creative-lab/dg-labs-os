import { copyFile, mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const sourceMarkdown = path.resolve(repoRoot, 'src/data/resume/cv.md');
const publicDir = path.resolve(repoRoot, 'public/cv');
const outDocx = path.resolve(publicDir, 'Dessi_Georgieva_CV.docx');
const outPdf = path.resolve(publicDir, 'Dessi_Georgieva_CV.pdf');
const outMarkdown = path.resolve(publicDir, 'Dessi_Georgieva_CV.md');

const runCommand = (cmd, args) => {
  const result = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf-8' });
  return {
    ok: result.status === 0,
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
    status: result.status,
    error: result.error,
  };
};

const commandExists = (cmd) => {
  const result = runCommand(cmd, ['--version']);
  return result.ok;
};

const choosePdfEngine = () => {
  const candidates = ['xelatex', 'pdflatex', 'lualatex', 'tectonic', 'wkhtmltopdf', 'weasyprint'];
  return candidates.find(commandExists) ?? null;
};

const run = async () => {
  await mkdir(publicDir, { recursive: true });

  if (!commandExists('pandoc')) {
    throw new Error(
      'Pandoc is not installed. Install it first: https://pandoc.org/installing.html'
    );
  }

  const pdfEngine = choosePdfEngine();
  if (!pdfEngine) {
    throw new Error(
      [
        'No supported PDF engine found for Pandoc.',
        'Install one of: xelatex, pdflatex, lualatex, tectonic, wkhtmltopdf, weasyprint.',
      ].join(' ')
    );
  }

  const commonArgs = ['--from', 'gfm', '--standalone'];

  const docxResult = runCommand('pandoc', [...commonArgs, sourceMarkdown, '-o', outDocx]);
  if (!docxResult.ok) {
    throw new Error(`DOCX build failed: ${docxResult.stderr || docxResult.stdout}`);
  }
  console.log(`Generated DOCX: ${outDocx}`);

  const pdfResult = runCommand('pandoc', [
    ...commonArgs,
    sourceMarkdown,
    '-o',
    outPdf,
    '--pdf-engine',
    pdfEngine,
  ]);
  if (!pdfResult.ok) {
    throw new Error(`PDF build failed (${pdfEngine}): ${pdfResult.stderr || pdfResult.stdout}`);
  }
  console.log(`Generated PDF: ${outPdf} (engine: ${pdfEngine})`);

  await copyFile(sourceMarkdown, outMarkdown);
  console.log(`Synced Markdown: ${outMarkdown}`);
};

run().catch((error) => {
  console.error('Failed to build resume assets:', error instanceof Error ? error.message : error);
  process.exit(1);
});
