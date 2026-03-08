import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isChatSuccessEnvelope,
  isHealthSuccessEnvelope,
  isToolSuccessEnvelope,
  isVerifySuccessEnvelope,
} from '../src/utils/apiContracts';

const mockOpenRouterSend = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseRange = vi.fn();
const mockGlobalFetch = vi.fn();

vi.mock('@openrouter/sdk', () => ({
  OpenRouter: class OpenRouter {
    chat = { send: mockOpenRouterSend };
  },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      insert: mockSupabaseInsert,
      select: () => ({
        order: () => ({
          range: mockSupabaseRange,
        }),
      }),
    }),
  }),
}));

describe('API route success contracts', () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = 'test-key';
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role';
    mockOpenRouterSend.mockReset();
    mockSupabaseInsert.mockReset();
    mockSupabaseRange.mockReset();
    mockGlobalFetch.mockReset();
    vi.stubGlobal('fetch', mockGlobalFetch);
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('chat returns ok:true and message on valid request', async () => {
    mockOpenRouterSend.mockResolvedValue({
      choices: [{ message: { content: 'Hello from model' } }],
    });

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isChatSuccessEnvelope(body)).toBe(true);
    if (!isChatSuccessEnvelope(body)) return;
    expect(body.message).toBe('Hello from model');
  });

  it('chat stream emits status and result events', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        [
          'event: message',
          'data: {"choices":[{"delta":{"content":"Hello "}}]}',
          '',
          'event: message',
          'data: {"choices":[{"delta":{"content":"from model"}}]}',
          '',
          'data: [DONE]',
          '',
        ].join('\n'),
        {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }
      )
    );

    const { POST } = await import('../src/pages/api/chat/stream');
    const request = new Request('http://localhost/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    const body = await response.text();
    expect(body).toContain('event: status');
    expect(body).toContain('Starting request…');
    expect(body).toContain('event: result');
    expect(body).toContain('Hello from model');
    expect(body).toContain('event: done');
  });

  it('chat falls back to configured provider when enabled', async () => {
    mockOpenRouterSend.mockResolvedValue({
      choices: [{ message: { content: 'Fallback from OpenRouter' } }],
    });

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        providerFallbackAllowed: true,
        messages: [{ role: 'user', content: 'hello with fallback' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok?: boolean;
      message?: string;
      meta?: { provider?: string; fallbackUsed?: boolean; fallbackFrom?: string };
    };
    expect(body.ok).toBe(true);
    expect(body.message).toBe('Fallback from OpenRouter');
    expect(body.meta?.provider).toBe('openrouter');
    expect(body.meta?.fallbackUsed).toBe(true);
    expect(body.meta?.fallbackFrom).toBe('openai');
  });

  it('chat does not fallback when fallback is disabled', async () => {
    mockOpenRouterSend.mockResolvedValue({
      choices: [{ message: { content: 'Should not be used' } }],
    });

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        providerFallbackAllowed: false,
        messages: [{ role: 'user', content: 'hello strict provider' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(503);
    const body = (await response.json()) as { ok?: boolean; code?: string };
    expect(body.ok).toBe(false);
    expect(body.code).toBe('CONFIG_ERROR');
    expect(mockOpenRouterSend).not.toHaveBeenCalled();
  });

  it('chat supports openai provider via responses API', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: 'Hello from OpenAI',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        byokApiKey: 'test-openai-key',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isChatSuccessEnvelope(body)).toBe(true);
    if (!isChatSuccessEnvelope(body)) return;
    expect(body.message).toBe('Hello from OpenAI');
    expect(mockGlobalFetch).toHaveBeenCalled();
  });

  it('chat supports anthropic provider via messages API', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [{ type: 'text', text: 'Hello from Anthropic' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-latest',
        byokApiKey: 'test-anthropic-key',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isChatSuccessEnvelope(body)).toBe(true);
    if (!isChatSuccessEnvelope(body)) return;
    expect(body.message).toBe('Hello from Anthropic');
    expect(mockGlobalFetch).toHaveBeenCalled();
  });

  it('chat supports gemini provider via generateContent API', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello from Gemini' }],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        byokApiKey: 'test-gemini-key',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isChatSuccessEnvelope(body)).toBe(true);
    if (!isChatSuccessEnvelope(body)) return;
    expect(body.message).toBe('Hello from Gemini');
    expect(mockGlobalFetch).toHaveBeenCalled();
  });

  it('chat normalizes invalid_key provider errors', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Invalid API key' } }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        byokApiKey: 'bad-key',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(401);
    const body = (await response.json()) as {
      ok?: boolean;
      code?: string;
      meta?: { provider?: string; errorClass?: string; hint?: string };
    };
    expect(body.ok).toBe(false);
    expect(body.code).toBe('INVALID_KEY');
    expect(body.meta?.provider).toBe('openai');
    expect(body.meta?.errorClass).toBe('INVALID_KEY');
    expect(body.meta?.hint).toContain('BYOK');
  });

  it('chat normalizes rate limit provider errors', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Rate limit exceeded' } }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-latest',
        byokApiKey: 'rate-limited-key',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(429);
    const body = (await response.json()) as {
      ok?: boolean;
      code?: string;
      meta?: { provider?: string; errorClass?: string };
    };
    expect(body.ok).toBe(false);
    expect(body.code).toBe('RATE_LIMITED');
    expect(body.meta?.provider).toBe('anthropic');
    expect(body.meta?.errorClass).toBe('RATE_LIMITED');
  });

  it('chat normalizes quota exceeded provider errors', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'insufficient_quota' } }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        byokApiKey: 'quota-key',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(429);
    const body = (await response.json()) as {
      ok?: boolean;
      code?: string;
      meta?: { errorClass?: string };
    };
    expect(body.ok).toBe(false);
    expect(body.code).toBe('QUOTA_EXCEEDED');
    expect(body.meta?.errorClass).toBe('QUOTA_EXCEEDED');
  });

  it('chat agent_json mode returns structured data', async () => {
    const { POST } = await import('../src/pages/api/chat');
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responseMode: 'agent_json',
        messages: [{ role: 'user', content: 'tell me about dessi projects' }],
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok?: boolean;
      mode?: string;
      data?: { chunks?: Array<{ id: string }> };
    };
    expect(body.ok).toBe(true);
    expect(body.mode).toBe('agent_json');
    expect(Array.isArray(body.data?.chunks)).toBe(true);
  });

  it('contact POST returns ok:true when insert succeeds', async () => {
    mockSupabaseInsert.mockResolvedValue({ error: null });

    const { POST } = await import('../src/pages/api/contact');
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dessi',
        email: 'dessi@example.com',
        message: 'Hi',
        t: 7,
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isHealthSuccessEnvelope(body)).toBe(true);
  });

  it('verify returns ok:true with citations when provider responds', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          AbstractText: 'Model Context Protocol is an open protocol for LLM tools.',
          AbstractURL: 'https://example.com/mcp',
          Heading: 'Model Context Protocol',
          RelatedTopics: [
            {
              Text: 'MCP spec - protocol details',
              FirstURL: 'https://example.com/mcp-spec',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { POST } = await import('../src/pages/api/verify');
    const request = new Request('http://localhost/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'model context protocol' }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isVerifySuccessEnvelope(body)).toBe(true);
    if (!isVerifySuccessEnvelope(body)) return;
    expect(body.sources.length).toBeGreaterThan(0);
  });

  it('tools local_context returns indexed hits', async () => {
    const { POST } = await import('../src/pages/api/tools');
    const request = new Request('http://localhost/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'local_context', input: { query: 'intent' } }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isToolSuccessEnvelope(body)).toBe(true);
    if (!isToolSuccessEnvelope(body)) return;
    expect(body.tool).toBe('local_context');
  });

  it('llm health POST probes selected provider with BYOK', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: 'pong',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { POST } = await import('../src/pages/api/llm/health');
    const request = new Request('http://localhost/api/llm/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: 'gpt-4.1-mini',
        byokApiKey: 'test-openai-key',
        probe: true,
      }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok?: boolean;
      probe?: boolean;
      providers?: Array<{ provider?: string; status?: string; configured?: boolean }>;
    };
    expect(body.ok).toBe(true);
    expect(body.probe).toBe(true);
    expect(body.providers?.[0]?.provider).toBe('openai');
    expect(body.providers?.[0]?.status).toBe('healthy');
    expect(body.providers?.[0]?.configured).toBe(true);
  });

  it('tools web_verify returns citations', async () => {
    mockGlobalFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          AbstractText: 'Open standards for tool integration.',
          AbstractURL: 'https://example.com/open-standards',
          Heading: 'MCP',
          RelatedTopics: [],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const { POST } = await import('../src/pages/api/tools');
    const request = new Request('http://localhost/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'web_verify', input: { query: 'mcp standard' } }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isToolSuccessEnvelope(body)).toBe(true);
    if (!isToolSuccessEnvelope(body)) return;
    expect(body.tool).toBe('web_verify');
  });

  it('tools retrieve returns classified local evidence hits', async () => {
    const { POST } = await import('../src/pages/api/tools');
    const request = new Request('http://localhost/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'retrieve', input: { query: 'intent recognition projects' } }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isToolSuccessEnvelope(body)).toBe(true);
    if (!isToolSuccessEnvelope(body)) return;
    expect(body.tool).toBe('retrieve');
  });

  it('tools cite returns evidence verdict', async () => {
    const { POST } = await import('../src/pages/api/tools');
    const request = new Request('http://localhost/api/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'cite', input: { claim: 'Dessi built intent systems' } }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isToolSuccessEnvelope(body)).toBe(true);
    if (!isToolSuccessEnvelope(body)) return;
    expect(body.tool).toBe('cite');
  });
});
