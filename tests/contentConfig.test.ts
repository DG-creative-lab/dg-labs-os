import { describe, expect, it } from 'vitest';
import { workbench } from '../src/config/workbench';
import { dessiWritingModule } from '../src/profiles/writing';

describe('content config sanity', () => {
  it('public Writing contains unique ids and absolute URLs', () => {
    const ids = new Set<string>();
    for (const note of dessiWritingModule.entries) {
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
    expect(workbench.find((item) => item.id === 'human-systems-platform')).toMatchObject({
      category: 'Selected Systems',
      classification: 'Founder product · Private development',
      title: 'Human Systems Platform',
    });
    expect(workbench.find((item) => item.id === 'learning-foundry')?.summary).toContain(
      'understanding they can explain, test, apply, and revise'
    );
    expect(workbench.find((item) => item.id === 'dg-os')?.summary).toContain(
      'public expression and discovery product within Human Systems Platform'
    );
    expect(workbench.find((item) => item.id === 'ai-news-hub')).toMatchObject({
      category: 'Selected Systems',
      classification: 'Open-source public platform · Active',
      links: {
        site: 'https://ai-news-hub.performics-labs.com/',
        repo: 'https://github.com/ai-knowledge-hub/performics_labs_ai_news',
      },
    });
    expect(workbench.find((item) => item.id === 'ai-skills-platform')).toMatchObject({
      category: 'Selected Systems',
      classification: 'Open-source public platform · Active',
      links: {
        site: 'https://skills.ai-knowledge-hub.org/',
        repo: 'https://github.com/ai-knowledge-hub/ai-skills-guide',
      },
    });
    expect(workbench.find((item) => item.id === 'gateplane-enterprise-auth')).toMatchObject({
      category: 'Selected Systems',
      classification: 'Personal deployed system · Private source',
      links: { site: 'https://gateplane-beta.vercel.app/overview' },
    });
    expect(ids).not.toContain('warehouse-award-platform');
    expect(ids).not.toContain('onesuite-labs-infra');
  });
});
