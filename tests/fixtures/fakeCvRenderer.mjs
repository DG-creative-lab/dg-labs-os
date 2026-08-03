import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const valueFor = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};
const valuesFor = (flag) =>
  args.flatMap((value, index) => (value === flag && args[index + 1] ? [args[index + 1]] : []));

const outputDirectory = valueFor('--output-dir');
const stem = valueFor('--stem');
if (!outputDirectory || !stem) {
  throw new Error('Fake CV renderer requires --output-dir and --stem.');
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, `${stem}.md`), 'fresh markdown');
await writeFile(path.join(outputDirectory, `${stem}.docx`), 'fresh docx');
if (process.env.CV_FAKE_RENDERER_MODE !== 'missing-pdf') {
  await writeFile(path.join(outputDirectory, `${stem}.pdf`), 'fresh pdf');
}

if (process.env.CV_FAKE_METADATA_PATH) {
  await writeFile(
    process.env.CV_FAKE_METADATA_PATH,
    JSON.stringify({
      displayName: valueFor('--display-name'),
      subject: valueFor('--subject'),
      language: valueFor('--language'),
      keywords: valuesFor('--keyword'),
    })
  );
}
