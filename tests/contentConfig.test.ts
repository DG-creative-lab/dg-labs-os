import { describe, expect, it } from 'vitest';
import { labNotes } from '../src/config/labNotes';
import { workbench } from '../src/config/workbench';

describe('content config sanity', () => {
  it('labNotes contains unique ids and absolute urls', () => {
    const ids = new Set<string>();
    for (const note of labNotes) {
      expect(ids.has(note.id)).toBe(false);
      ids.add(note.id);
      expect(note.url.startsWith('http://') || note.url.startsWith('https://')).toBe(true);
    }
  });

  it('workbench items have required basic fields', () => {
    for (const item of workbench) {
      expect(item.id.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
      expect(item.stack.length).toBeGreaterThan(0);
    }
  });
});
