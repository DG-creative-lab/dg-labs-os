import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { architectureManifest } from '../../architecture/manifest.mjs';

const extensions = new Set(architectureManifest.sourceExtensions);

const walk = (directory: string): string[] =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(target);
    return extensions.has(path.extname(entry.name)) ? [target.split(path.sep).join('/')] : [];
  });

const matchingZones = (file: string) =>
  architectureManifest.zones.filter((zone) => zone.matches.some((pattern) => pattern.test(file)));

describe('architecture zone assignments', () => {
  it('assigns every source file to exactly one zone', () => {
    for (const file of walk('src')) {
      expect(
        matchingZones(file).map((zone) => zone.id),
        `${file} must match exactly one zone`
      ).toHaveLength(1);
    }
  });

  it('keeps API routes outside the UI zone', () => {
    expect(matchingZones('src/pages/api/chat.ts').map((zone) => zone.id)).toEqual(['api']);
    expect(matchingZones('src/pages/index.astro').map((zone) => zone.id)).toEqual(['ui']);
  });
});
