import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isAdminLoginSuccessEnvelope,
  isAdminMessagesSuccessEnvelope,
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
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD = 'super-secret';
    process.env.ADMIN_SESSION_SECRET = 'very-secret-signing-key';
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
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
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

  it('admin login returns success and sets cookie', async () => {
    const { POST } = await import('../src/pages/api/admin/login');
    const request = new Request('http://localhost/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'super-secret' }),
    });

    const response = await POST({ request } as Parameters<typeof POST>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isAdminLoginSuccessEnvelope(body)).toBe(true);
    const setCookie = response.headers.get('Set-Cookie') ?? '';
    expect(setCookie).toContain('admin_session=');
    expect(setCookie).toContain('HttpOnly');
  });

  it('admin messages GET returns ok:true with data for valid session cookie', async () => {
    mockSupabaseRange.mockResolvedValue({
      data: [{ id: 'm1', name: 'Dessi' }],
      error: null,
      count: 1,
    });

    const { createAdminSessionToken } = await import('../src/utils/adminAuth');
    const token = createAdminSessionToken('admin', 'very-secret-signing-key');
    const { GET } = await import('../src/pages/api/admin/messages');
    const request = new Request('http://localhost/api/admin/messages?limit=10', {
      headers: { cookie: `admin_session=${token}` },
    });

    const response = await GET({ request } as Parameters<typeof GET>[0]);
    expect(response.status).toBe(200);
    const body = (await response.json()) as unknown;
    expect(isAdminMessagesSuccessEnvelope(body)).toBe(true);
    if (!isAdminMessagesSuccessEnvelope(body)) return;
    expect(body.data.length).toBe(1);
    expect(body.count).toBe(1);
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
});
