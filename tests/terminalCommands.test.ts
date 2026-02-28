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

  it('returns clear action', () => {
    const result = executeTerminalCommand('clear', ctx);
    expect(result.action.type).toBe('clear');
  });
});
