import { describe, expect, it } from 'vitest';
import { userConfig } from '../src/config';
import { labNotes } from '../src/config/labNotes';
import { networkNodes } from '../src/config/network';
import { workbench } from '../src/config/workbench';
import {
  buildLlmMessages,
  buildTerminalSystemContext,
  isLlmQuery,
  normalizeLlmQuery,
  readChatMessage,
  TERMINAL_LLM_MAX_QUERY_CHARS,
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

  it('extracts chat message from payload', () => {
    expect(readChatMessage({ message: 'ok' })).toBe('ok');
    expect(readChatMessage({})).toBeNull();
  });
});
