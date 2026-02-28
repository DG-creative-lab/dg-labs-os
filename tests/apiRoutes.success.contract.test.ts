import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isAdminLoginSuccessEnvelope,
  isAdminMessagesSuccessEnvelope,
  isChatSuccessEnvelope,
  isHealthSuccessEnvelope,
} from '../src/utils/apiContracts';

const mockOpenRouterSend = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseRange = vi.fn();

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
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
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
});
