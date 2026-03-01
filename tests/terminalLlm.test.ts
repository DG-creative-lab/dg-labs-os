import { describe, expect, it } from 'vitest';
import { userConfig } from '../src/config';
import { labNotes } from '../src/config/labNotes';
import { networkNodes } from '../src/config/network';
import { workbench } from '../src/config/workbench';
import {
  buildAgentJsonLines,
  buildLlmMessages,
  buildTerminalSystemContext,
  isLlmQuery,
  normalizeLlmQuery,
  readAgentJsonPayload,
  readChatMessage,
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
    expect(messages[messages.length - 1].content).toBe('What is DG-Labs OS?');
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
});
