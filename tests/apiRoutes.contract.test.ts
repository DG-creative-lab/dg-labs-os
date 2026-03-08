import { describe, expect, it } from 'vitest';
import { isApiErrorEnvelope, isHealthSuccessEnvelope } from '../src/utils/apiContracts';
import { POST as chatPost } from '../src/pages/api/chat';
import { POST as chatStreamPost } from '../src/pages/api/chat/stream';
import { GET as contactGet, POST as contactPost } from '../src/pages/api/contact';
import { POST as toolsPost } from '../src/pages/api/tools';
import { POST as verifyPost } from '../src/pages/api/verify';
import { GET as llmHealthGet, POST as llmHealthPost } from '../src/pages/api/llm/health';

const ctx = (request: Request) => ({ request }) as Parameters<typeof chatPost>[0];

describe('API route contracts', () => {
  it('chat returns CONFIG_ERROR when OPENROUTER is not configured', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await chatPost(ctx(request));
    expect(response.status).toBe(503);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('CONFIG_ERROR');
    expect(body.error).toBe(body.message);
    expect(typeof body.timestamp).toBe('string');
  });

  it('chat returns CONFIG_ERROR when selected provider key is missing', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await chatPost(ctx(request));
    expect(response.status).toBe(503);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('CONFIG_ERROR');
  });

  it('chat agent_json mode returns structured response without LLM provider', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responseMode: 'agent_json',
        messages: [{ role: 'user', content: 'what has dessi built?' }],
      }),
    });

    const response = await chatPost(ctx(request));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok?: boolean; mode?: string; data?: unknown };
    expect(body.ok).toBe(true);
    expect(body.mode).toBe('agent_json');
    expect(body.data).toBeTruthy();
  });

  it('chat stream rejects invalid json', async () => {
    const request = new Request('http://localhost/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ bad json',
    });

    const response = await chatStreamPost(ctx(request));
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('INVALID_JSON');
  });

  it('contact GET health returns ok', async () => {
    const request = new Request('http://localhost/api/contact');
    const response = await contactGet(ctx(request));
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isHealthSuccessEnvelope(body)).toBe(true);
  });

  it('llm health GET returns provider statuses without probe', async () => {
    const request = new Request('http://localhost/api/llm/health?probe=0');
    const response = await llmHealthGet(ctx(request));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok?: boolean; providers?: unknown[] };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.providers)).toBe(true);
    expect((body.providers ?? []).length).toBeGreaterThan(0);
  });

  it('llm health POST rejects invalid JSON', async () => {
    const request = new Request('http://localhost/api/llm/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ bad json',
    });
    const response = await llmHealthPost(ctx(request));
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('INVALID_JSON');
  });

  it('contact POST rejects invalid payload with normalized error', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'missing required fields' }),
    });

    const response = await contactPost(ctx(request));
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('INVALID_FIELDS');
    expect(body.error).toBe(body.message);
  });

  it('contact POST returns UNCONFIGURED when supabase env is missing', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dessi',
        email: 'dessi@example.com',
        message: 'hello',
      }),
    });

    const response = await contactPost(ctx(request));
    expect(response.status).toBe(503);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('UNCONFIGURED');
    expect(body.error).toBe(body.message);
  });

  it('verify POST rejects invalid payload with normalized error', async () => {
    const request = new Request('http://localhost/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '' }),
    });

    const response = await verifyPost(ctx(request));
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('INVALID_QUERY');
    expect(body.error).toBe(body.message);
  });

  it('tools POST rejects invalid tool call payload', async () => {
    const request = new Request('http://localhost/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'bad_tool' }),
    });

    const response = await toolsPost(ctx(request));
    expect(response.status).toBe(400);
    const body = (await response.json()) as unknown;
    expect(isApiErrorEnvelope(body)).toBe(true);
    if (!isApiErrorEnvelope(body)) return;
    expect(body.code).toBe('INVALID_TOOL_CALL');
  });
});
