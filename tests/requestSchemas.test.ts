import { describe, expect, it } from 'vitest';
import {
  parseChatRequestInput,
  parseChatMessagesInput,
  parseContactInput,
  parseToolCallInput,
  parseVerifyInput,
} from '../src/utils/requestSchemas';

describe('request schemas', () => {
  it('parses valid contact input', () => {
    const parsed = parseContactInput({
      name: 'Dessi',
      email: 'dessi@example.com',
      message: 'hello',
      company: '',
      t: 12,
    });
    expect(parsed?.name).toBe('Dessi');
    expect(parsed?.t).toBe(12);
  });

  it('rejects invalid contact input', () => {
    expect(parseContactInput({ name: 1, email: 'a', message: 'x' })).toBeNull();
  });

  it('parses valid chat messages payload', () => {
    const parsed = parseChatMessagesInput({
      messages: [
        { role: 'system', content: 'rules' },
        { role: 'user', content: 'hello' },
      ],
    });
    expect(parsed?.length).toBe(2);
  });

  it('rejects invalid chat payload', () => {
    expect(parseChatMessagesInput({ messages: [{ role: 'bad', content: 'x' }] })).toBeNull();
    expect(parseChatMessagesInput({ messages: [] })).toBeNull();
  });

  it('parses valid chat request with response mode', () => {
    const parsed = parseChatRequestInput({
      messages: [{ role: 'user', content: 'hello' }],
      responseMode: 'agent_json',
    });
    expect(parsed?.responseMode).toBe('agent_json');
    expect(parsed?.messages.length).toBe(1);
  });

  it('parses valid verify input', () => {
    const parsed = parseVerifyInput({ query: 'agentic marketing verification' });
    expect(parsed?.query).toBe('agentic marketing verification');
  });

  it('rejects invalid verify input', () => {
    expect(parseVerifyInput({ query: '' })).toBeNull();
    expect(parseVerifyInput({})).toBeNull();
  });

  it('parses valid tool call input', () => {
    const parsed = parseToolCallInput({ tool: 'local_context', input: { query: 'intent' } });
    expect(parsed?.tool).toBe('local_context');
  });

  it('parses retrieve/cite tool call input', () => {
    const retrieve = parseToolCallInput({ tool: 'retrieve', input: { query: 'projects' } });
    const cite = parseToolCallInput({ tool: 'cite', input: { claim: 'Dessi built X' } });
    expect(retrieve?.tool).toBe('retrieve');
    expect(cite?.tool).toBe('cite');
  });

  it('rejects invalid tool call input', () => {
    expect(parseToolCallInput({ tool: 'bad_tool' })).toBeNull();
  });
});
