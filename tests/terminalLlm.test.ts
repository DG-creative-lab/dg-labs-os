import { describe, expect, it } from 'vitest';
import { userConfig } from '../src/config';
import { labNotes } from '../src/config/labNotes';
import { networkNodes } from '../src/config/network';
import { workbench } from '../src/config/workbench';
import {
  buildCitationChips,
  confidenceBadgeText,
  explainConfidenceLabel,
  explainVerificationGap,
  buildAgentJsonLines,
  buildLlmMessages,
  buildTerminalSystemContext,
  formatAnswerWithCitations,
  groupCitationChips,
  isLlmQuery,
  normalizeLlmQuery,
  parseLlmModeQuery,
  readAgentJsonPayload,
  readChatMessage,
  resolveAnswerConfidenceLabel,
  TERMINAL_LLM_HISTORY_CHAR_BUDGET,
  TERMINAL_LLM_MAX_QUERY_CHARS,
  TERMINAL_LLM_SYSTEM_CHAR_BUDGET,
} from '../src/utils/terminalLlm';

describe('terminal llm helpers', () => {
  it('routes ask-prefixed input to llm', () => {
    expect(isLlmQuery('ask explain this app', true)).toBe(true);
  });

  it('routes non-command text to llm', () => {
    expect(isLlmQuery('what does this app do?', false)).toBe(true);
  });

  it('keeps deterministic command out of llm path', () => {
    expect(isLlmQuery('projects', true)).toBe(false);
  });

  it('normalizes ask prefix and enforces max length', () => {
    const q = normalizeLlmQuery(`ask ${'x'.repeat(TERMINAL_LLM_MAX_QUERY_CHARS + 100)}`);
    expect(q.length).toBe(TERMINAL_LLM_MAX_QUERY_CHARS);
  });

  it('parses llm answer modes from command prefixes', () => {
    expect(parseLlmModeQuery('brief top 3 projects')).toEqual({
      mode: 'brief',
      query: 'top 3 projects',
    });
    expect(parseLlmModeQuery('cv current role')).toEqual({
      mode: 'cv',
      query: 'current role',
    });
    expect(parseLlmModeQuery('projects intent systems')).toEqual({
      mode: 'projects',
      query: 'intent systems',
    });
  });

  it('builds grounded system context and messages', () => {
    const ctx = {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    };
    const system = buildTerminalSystemContext(ctx, 'research');
    expect(system).toContain('DG-Labs OS terminal brain');
    expect(system).toContain(
      'Identity contract: DG-Labs OS is the cognitive interface of Dessi Georgieva'
    );
    expect(system).toContain('Response mode: research');
    const messages = buildLlmMessages(
      'What is DG-Labs OS?',
      ctx,
      [
        { role: 'user', content: 'hello' },
        { role: 'assistant', content: 'hi' },
      ],
      [
        {
          id: 'workbench-intent-geometry-agent',
          source: 'workbench',
          title: 'Intent Recognition Agent',
          snippet: 'Intent modeling system.',
          tags: ['intent'],
          score: 7,
        },
      ]
    );
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('Grounded context snippets');
    expect(messages[0].content).toContain('Intent Recognition Agent');
    expect(messages[0].content).toContain('Answer style: ask.');
    expect(messages[messages.length - 1].content).toBe('What is DG-Labs OS?');
  });

  it('injects answer mode instruction for projects mode', () => {
    const ctx = {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    };
    const messages = buildLlmMessages('show systems', ctx, [], [], null, 'concise', 'projects');
    expect(messages[0].content).toContain('Answer style: projects.');
  });

  it('applies context budget and prioritizes high-score grounding', () => {
    const ctx = {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    };
    const long = 'x'.repeat(600);
    const messages = buildLlmMessages(
      'Explain projects and research',
      ctx,
      Array.from({ length: 40 }, (_, i) => ({
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `history-${i}-${long}`,
      })),
      [
        {
          id: 'low-score',
          source: 'brain',
          title: 'Low score',
          snippet: long,
          tags: ['test'],
          score: 1,
        },
        {
          id: 'high-score',
          source: 'brain',
          title: 'High score',
          snippet: long,
          tags: ['test'],
          score: 99,
        },
      ]
    );

    const system = messages[0].content;
    expect(system.length).toBeLessThanOrEqual(TERMINAL_LLM_SYSTEM_CHAR_BUDGET + 128);
    expect(system).toContain('High score');

    const historyChars = messages
      .slice(1, -1)
      .reduce((sum, message) => sum + message.content.length, 0);
    expect(historyChars).toBeLessThanOrEqual(TERMINAL_LLM_HISTORY_CHAR_BUDGET);
  });

  it('extracts chat message from payload', () => {
    expect(readChatMessage({ message: 'ok' })).toBe('ok');
    expect(readChatMessage({})).toBeNull();
  });

  it('reads and formats agent_json payload', () => {
    const payload = readAgentJsonPayload({
      ok: true,
      mode: 'agent_json',
      data: {
        query: 'projects',
        classification: 'project',
        chunks: [
          {
            id: 'project-1',
            type: 'project',
            title: 'Intent Recognition Agent',
            confidence: 'high',
            score: 9,
            sources: ['github'],
            related: ['research-1'],
          },
        ],
        sources: ['github'],
        suggestedFollowUp: ['Compare two projects'],
      },
    });

    expect(payload).not.toBeNull();
    if (!payload) return;
    expect(payload.classification).toBe('project');
    const lines = buildAgentJsonLines(payload);
    expect(lines[0]).toBe('[agent_json]');
    expect(lines.join('\n')).toContain('Intent Recognition Agent');
    expect(lines.join('\n')).toContain('[suggested_follow_up]');
  });

  it('formats answer with numbered citations', () => {
    const result = formatAnswerWithCitations(
      'Dessi built an Intent Recognition Agent. It supports intent modeling workflows.',
      [
        {
          source: 'workbench',
          title: 'Intent Recognition Agent',
          snippet: 'Intent modeling system with multi-agent workflow support.',
          url: 'https://example.com/intent',
          score: 20,
        },
      ],
      false
    );
    expect(result.answer).toContain('[1]');
    expect(result.citationLines[0]).toContain('[1] Intent Recognition Agent');
    expect(result.unverifiedCount).toBe(0);
  });

  it('returns insufficient evidence in strict mode when unsupported', () => {
    const result = formatAnswerWithCitations(
      'This unrelated statement has no evidence overlap.',
      [],
      true
    );
    expect(result.answer).toContain('Insufficient evidence');
    expect(result.unverifiedCount).toBe(1);
  });

  it('resolves confidence labels for local/web combinations', () => {
    expect(resolveAnswerConfidenceLabel(2, 0)).toBe('local-only');
    expect(resolveAnswerConfidenceLabel(2, 1)).toBe('local+verified');
    expect(resolveAnswerConfidenceLabel(0, 1)).toBe('verified-only');
    expect(resolveAnswerConfidenceLabel(0, 0)).toBe('low-confidence');
  });

  it('maps confidence labels to compact badge text', () => {
    expect(confidenceBadgeText('local+verified')).toBe('corroborated');
    expect(confidenceBadgeText('local-only')).toBe('local only');
    expect(confidenceBadgeText('verified-only')).toBe('verified only');
    expect(confidenceBadgeText('low-confidence')).toBe('low confidence');
  });

  it('injects mode-specific instruction for ask, brief, cv and projects', () => {
    const ctx = {
      user: userConfig,
      workbench,
      notes: labNotes,
      network: networkNodes,
    };
    const ask = buildLlmMessages('q', ctx, [], [], null, 'concise', 'ask')[0].content;
    const brief = buildLlmMessages('q', ctx, [], [], null, 'concise', 'brief')[0].content;
    const cv = buildLlmMessages('q', ctx, [], [], null, 'concise', 'cv')[0].content;
    const projects = buildLlmMessages('q', ctx, [], [], null, 'concise', 'projects')[0].content;
    expect(ask).toContain('Answer style: ask.');
    expect(brief).toContain('Answer style: brief.');
    expect(cv).toContain('Answer style: cv.');
    expect(projects).toContain('Answer style: projects.');
  });

  it('builds grouped citation chips with local + web sources', () => {
    const chips = buildCitationChips(
      [
        {
          source: 'personal',
          title: 'Profile',
          snippet: 'summary',
          url: 'https://example.com/profile',
          score: 10,
        },
        {
          source: 'workbench',
          title: 'Intent Recognition Agent',
          snippet: 'system',
          url: 'https://example.com/project',
          score: 20,
        },
      ],
      [
        {
          title: 'External validation',
          url: 'https://example.com/web',
          snippet: 'verified',
        },
      ]
    );
    expect(chips.map((chip) => chip.group)).toEqual(['Profile', 'Projects', 'Web']);
  });

  it('groups citation chips by display category in stable order', () => {
    const grouped = groupCitationChips([
      { group: 'Web', label: 'External validation', url: 'https://example.com/web' },
      { group: 'Projects', label: 'Intent Recognition Agent', url: 'https://example.com/project' },
      { group: 'Profile', label: 'LinkedIn', url: 'https://example.com/profile' },
    ]);
    expect(grouped.map((bucket) => bucket.group)).toEqual(['Profile', 'Projects', 'Web']);
  });

  it('explains confidence label with trust guidance', () => {
    expect(explainConfidenceLabel('local+verified')).toContain('corroborated');
    expect(explainConfidenceLabel('local-only')).toContain('run verify');
    expect(explainConfidenceLabel('verified-only')).toContain('web-verified');
    expect(explainConfidenceLabel('low-confidence')).toContain('low evidence');
  });

  it('reports verification gap when web verification has no corroborating sources', () => {
    expect(explainVerificationGap(0, 'dessi projects')).toContain('Verification gap');
    expect(explainVerificationGap(0, 'dessi projects')).toContain('dessi projects');
    expect(explainVerificationGap(2, 'dessi projects')).toBeNull();
  });
});
