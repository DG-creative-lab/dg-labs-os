import { describe, expect, it } from 'vitest';
import {
  parseAdminLoginInput,
  parseChatMessagesInput,
  parseContactInput,
  parseToolCallInput,
  parseVerifyInput,
} from '../src/utils/requestSchemas';

describe('request schemas', () => {
  it('parses valid admin login input', () => {
    const parsed = parseAdminLoginInput({ username: 'admin', password: 'secret' });
    expect(parsed).toEqual({ username: 'admin', password: 'secret' });
  });

  it('rejects invalid admin login input', () => {
    expect(parseAdminLoginInput({ username: 'admin' })).toBeNull();
  });

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

  it('rejects invalid tool call input', () => {
    expect(parseToolCallInput({ tool: 'bad_tool' })).toBeNull();
  });
});
