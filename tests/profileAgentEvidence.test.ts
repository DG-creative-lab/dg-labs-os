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
    expect(context?.evidence.currentFocus.length).toBeGreaterThan(0);
  });

  it('includes only registered reviewed Writing in deterministic retrieval', () => {
    const context = findProfileAgentContext('dessi');
    expect(context).toBeDefined();
    if (!context) return;

    const lines = executeProfileEvidenceCommand('search', 'deterministic core', context);
    expect(lines.join('\n')).toContain('[writing] The Deterministic Core');
    expect(lines.join('\n')).not.toContain('[notes]');
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
