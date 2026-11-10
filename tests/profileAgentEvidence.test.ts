import { describe, expect, it } from 'vitest';
import { searchKnowledgeEntries } from '../src/knowledge';
import { findProfileAgentContext } from '../src/profiles/agentEvidence';
import { executeProfileEvidenceCommand } from '../src/services/profileEvidenceCommands';

describe('Profile Agent evidence registry', () => {
  it('binds Dessi to her explicitly registered public evidence', () => {
    const context = findProfileAgentContext('dessi');
    expect(context?.profile.handle).toBe('dessi');
    expect(context?.evidence.brain.length).toBeGreaterThan(0);
    expect(context?.evidence.workbench.length).toBeGreaterThan(0);
    expect(context?.evidence.writing.length).toBeGreaterThan(0);
    expect(context?.evidence.network.length).toBeGreaterThan(0);
    expect(context?.evidence.currentFocus.length).toBeGreaterThan(0);
    expect(context?.evidence.brain.some((entry) => entry.file === 'profile-module:network')).toBe(
      true
    );
  });

  it('includes only registered reviewed Writing in deterministic retrieval', () => {
    const context = findProfileAgentContext('dessi');
    expect(context).toBeDefined();
    if (!context) return;

    const lines = executeProfileEvidenceCommand('search', 'deterministic core', context);
    expect(lines.join('\n')).toContain('[writing] The Deterministic Core');
    expect(lines.join('\n')).not.toContain('[notes]');
  });

  it('surfaces both campaign agents as current work with their public sources', () => {
    const context = findProfileAgentContext('dessi');
    expect(context).toBeDefined();
    if (!context) return;

    const currentWork = executeProfileEvidenceCommand('now', '', context);
    expect(currentWork[1]).toContain('Direct Acquisition Agent and YouTube Ad Agent');

    for (const query of ['What is Dessi working on now?', 'marketing agents she is building']) {
      const hits = searchKnowledgeEntries(context.evidence.brain, query, 6);
      const campaignFocus = hits.find((hit) =>
        hit.title.includes('Direct Acquisition Agent and YouTube Ad Agent')
      );
      expect(campaignFocus?.sources).toEqual([
        'https://github.com/DG-creative-lab/direct-acquisition-agent',
        'https://github.com/DG-creative-lab/youtube-ad-agent',
      ]);
      expect(campaignFocus?.content).toContain('synthetic report completeness');
      expect(campaignFocus?.content).toContain('local viewer activity');
    }
  });

  it('credits Dessi’s writing through her independent publication', () => {
    const context = findProfileAgentContext('dessi')!;
    const { brain } = context.evidence;
    expect(
      brain.find(({ id }) => id === 'module-claim-geometry-of-intention-authorship')
    ).toMatchObject({
      title: 'Dessi Georgieva wrote The Geometry of Intention, available on AI Knowledge Hub.',
      confidence: 'verified',
      sources: [
        'https://ai-knowledge-hub.org/library/geometry-of-intention-llms-human-goals-marketing/',
      ],
    });
    expect(JSON.stringify(context.evidence)).not.toMatch(/performics/i);
  });

  it('does not fall back to Dessi evidence for another handle', () => {
    expect(findProfileAgentContext('another-person')).toBeUndefined();
  });

  it('searches only the entries supplied by the selected profile context', () => {
    const context = findProfileAgentContext('dessi');
    expect(context).toBeDefined();
    if (!context) return;

    const isolatedEntries = context.evidence.brain.slice(0, 1);
    const hits = searchKnowledgeEntries(isolatedEntries, isolatedEntries[0].title, 8);
    expect(hits.every((hit) => hit.id === isolatedEntries[0].id)).toBe(true);
  });

  it('executes deterministic commands only against the supplied evidence context', () => {
    const context = findProfileAgentContext('dessi');
    expect(context).toBeDefined();
    if (!context) return;

    const isolatedContext = {
      ...context,
      evidence: {
        ...context.evidence,
        workbench: context.evidence.workbench.slice(0, 1),
      },
    };
    const lines = executeProfileEvidenceCommand('projects', '', isolatedContext);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain(context.evidence.workbench[0].id);
    expect(lines.join('\n')).not.toContain(context.evidence.workbench[1].id);
  });
});
