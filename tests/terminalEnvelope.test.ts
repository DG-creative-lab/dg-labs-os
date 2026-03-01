import { describe, expect, it } from 'vitest';
import { buildAskEnvelopeLines, buildVerifyEnvelopeLines } from '../src/utils/terminalEnvelope';

describe('terminal envelope', () => {
  it('builds ask envelope with local/web split', () => {
    const lines = buildAskEnvelopeLines(
      [
        {
          id: 'workbench-intent',
          source: 'workbench',
          title: 'Intent Recognition Agent',
          snippet: 'Intent inference system.',
          tags: ['intent'],
          score: 9,
        },
      ],
      true
    );

    expect(lines.join('\n')).toContain('[local_context]');
    expect(lines.join('\n')).toContain('[web_context]');
    expect(lines.join('\n')).toContain('workbench:Intent Recognition Agent');
  });

  it('builds verify envelope with web citations', () => {
    const lines = buildVerifyEnvelopeLines('Found sources.', [
      { title: 'MCP', url: 'https://example.com', snippet: 'Protocol details.' },
    ]);

    expect(lines.join('\n')).toContain('[local_context]');
    expect(lines.join('\n')).toContain('[web_context]');
    expect(lines.join('\n')).toContain('https://example.com');
  });
});
