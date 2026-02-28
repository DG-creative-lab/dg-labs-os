import { describe, expect, it } from 'vitest';
import { routeNaturalLanguageCommand } from '../src/utils/terminalRouter';

describe('terminal natural language router', () => {
  it('routes navigation phrasing to open command', () => {
    const routed = routeNaturalLanguageCommand('can you open the network app');
    expect(routed?.command).toBe('open network');
  });

  it('routes search phrases to deterministic search command', () => {
    const routed = routeNaturalLanguageCommand('find empowerment research');
    expect(routed?.command).toBe('search empowerment research');
  });

  it('routes context phrases to deterministic context command', () => {
    const routed = routeNaturalLanguageCommand('what do you know about intent modeling');
    expect(routed?.command).toBe('context intent modeling');
  });

  it('returns null for unrelated text', () => {
    const routed = routeNaturalLanguageCommand('tell me a joke about compilers');
    expect(routed).toBeNull();
  });
});
