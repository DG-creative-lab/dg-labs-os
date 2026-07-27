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
      expect(item.classification.length).toBeGreaterThan(0);
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
      expect(item.stack.length).toBeGreaterThan(0);
    }
  });

  it('keeps the workbench focused on selected systems and bounded professional context', () => {
    const ids = workbench.map((item) => item.id);

    expect(ids).toContain('dg-os');
    expect(ids).toContain('agentic-commerce-loop');
    expect(ids).toContain('learning-foundry');
    expect(ids).toContain('intent-geometry-agent');
    expect(workbench.find((item) => item.id === 'gateplane-enterprise-auth')).toMatchObject({
      category: 'Selected Systems',
      classification: 'Personal deployed system · Private source',
      links: { site: 'https://gateplane-beta.vercel.app/overview' },
    });
    expect(ids).not.toContain('warehouse-award-platform');
    expect(ids).not.toContain('ai-news-hub');
    expect(ids).not.toContain('onesuite-labs-infra');
  });
});
