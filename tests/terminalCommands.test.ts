import { describe, expect, it } from 'vitest';
import { userConfig } from '../src/config';
import { labNotes } from '../src/config/labNotes';
import { networkNodes } from '../src/config/network';
import { workbench } from '../src/config/workbench';
import { executeTerminalCommand } from '../src/utils/terminalCommands';

const ctx = {
  user: userConfig,
  workbench,
  notes: labNotes,
  network: networkNodes,
};

describe('executeTerminalCommand', () => {
  it('returns help lines', () => {
    const result = executeTerminalCommand('help', ctx);
    expect(result.lines.length).toBeGreaterThan(5);
    expect(result.lines[0]).toContain('Available commands');
  });

  it('supports open command with navigation action', () => {
    const result = executeTerminalCommand('open network', ctx);
    expect(result.action.type).toBe('navigate');
    if (result.action.type === 'navigate') {
      expect(result.action.href).toBe('/apps/network');
    }
  });

  it('returns unknown command guidance', () => {
    const result = executeTerminalCommand('foo-bar-baz', ctx);
    expect(result.action.type).toBe('none');
    expect(result.lines.join(' ')).toContain('Unknown command');
  });

  it('searches across app content', () => {
    const result = executeTerminalCommand('search empowerment', ctx);
    expect(result.action.type).toBe('none');
    expect(result.lines[0]).toContain('Results for');
  });

  it('shows indexed sources', () => {
    const result = executeTerminalCommand('sources', ctx);
    expect(result.action.type).toBe('none');
    expect(result.lines[0]).toContain('Indexed sources');
    expect(result.lines.join(' ')).toContain('workbench');
  });

  it('retrieves grounded context snippets', () => {
    const result = executeTerminalCommand('context intent', ctx);
    expect(result.action.type).toBe('none');
    expect(result.lines[0]).toContain('Context hits for');
    expect(result.lines.join(' ')).toMatch(/\[(workbench|network|brain)\]/);
  });

  it('sets brain mode with deterministic mode command', () => {
    const result = executeTerminalCommand('mode research', ctx);
    expect(result.action.type).toBe('set_mode');
    if (result.action.type === 'set_mode') {
      expect(result.action.mode).toBe('research');
    }
  });

  it('routes verify command to verify action', () => {
    const result = executeTerminalCommand('verify latest mcp spec', ctx);
    expect(result.action.type).toBe('verify');
    if (result.action.type === 'verify') {
      expect(result.action.query).toContain('latest mcp spec');
    }
  });

  it('returns links from centralized links registry', () => {
    const result = executeTerminalCommand('links', ctx);
    expect(result.action.type).toBe('none');
    expect(result.lines.join(' ')).toContain('LinkedIn:');
    expect(result.lines.join(' ')).toContain('AI Skills Platform:');
  });

  it('returns list_tools action for tools command', () => {
    const result = executeTerminalCommand('tools', ctx);
    expect(result.action.type).toBe('list_tools');
  });

  it('routes tool command to tool_call action', () => {
    const result = executeTerminalCommand('tool local_context intent modeling', ctx);
    expect(result.action.type).toBe('tool_call');
    if (result.action.type === 'tool_call') {
      expect(result.action.tool).toBe('local_context');
      expect(result.action.input?.query).toBe('intent modeling');
    }
  });

  it('returns clear action', () => {
    const result = executeTerminalCommand('clear', ctx);
    expect(result.action.type).toBe('clear');
  });
});
