import { describe, expect, it } from 'vitest';
import {
  defaultTerminalSettings,
  parseTerminalSettings,
  sanitizeTerminalSettings,
  terminalSettingsSummary,
} from '../src/utils/terminalSettings';

describe('terminal settings', () => {
  it('returns defaults for null/invalid input', () => {
    expect(parseTerminalSettings(null)).toEqual(defaultTerminalSettings);
    expect(parseTerminalSettings('not-json')).toEqual(defaultTerminalSettings);
  });

  it('fills routerDebug for legacy stored settings', () => {
    const parsed = parseTerminalSettings(
      JSON.stringify({
        llmFallbackForUnknown: false,
        llmTimeoutMs: 12000,
        llmSessionCap: 12,
      })
    );
    expect(parsed.routerDebug).toBe(true);
    expect(parsed.showLlmSources).toBe(true);
    expect(parsed.brainMode).toBe('concise');
    expect(parsed.responseMode).toBe('narrative');
  });

  it('sanitizes ranges', () => {
    const s = sanitizeTerminalSettings({
      brainMode: 'research',
      responseMode: 'agent_json',
      llmFallbackForUnknown: true,
      routerDebug: false,
      showLlmSources: false,
      llmSessionCap: 1000,
      llmTimeoutMs: 200000,
    });
    expect(s.brainMode).toBe('research');
    expect(s.responseMode).toBe('agent_json');
    expect(s.routerDebug).toBe(false);
    expect(s.showLlmSources).toBe(false);
    expect(s.llmSessionCap).toBe(100);
    expect(s.llmTimeoutMs).toBe(120000);
  });

  it('builds readable summary', () => {
    const summary = terminalSettingsSummary(defaultTerminalSettings);
    expect(summary).toContain('mode=');
    expect(summary).toContain('response=');
    expect(summary).toContain('fallback=');
    expect(summary).toContain('router-debug=');
    expect(summary).toContain('llm-sources=');
    expect(summary).toContain('timeout=');
    expect(summary).toContain('session-cap=');
  });
});
