import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getAdminSessionSecret, verifyAdminSessionToken } from '../../../utils/adminAuth';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
const err = (message: string, status = 400) => json({ message }, status);

const clearSession = (request: Request) => {
  const isSecure = new URL(request.url).protocol === 'https:';
  const securePart = isSecure ? ' Secure;' : '';
  const response = json({ ok: true });
  response.headers.append(
    'Set-Cookie',
    `admin_session=; HttpOnly;${securePart} SameSite=Lax; Path=/; Max-Age=0`
  );
  return response;
};

const getToken = (request: Request): string | undefined => {
  const fromHeader = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (fromHeader) return fromHeader;

  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return match?.[1];
};

export const GET: APIRoute = async ({ request }) => {
  const token = getToken(request);
  const ADMIN_SESSION_SECRET = getAdminSessionSecret();
  if (!token || !ADMIN_SESSION_SECRET || !verifyAdminSessionToken(token, ADMIN_SESSION_SECRET)) {
    return err('Unauthorized', 401);
  }

  const SUPABASE_URL = import.meta.env.SUPABASE_URL as string | undefined;
  const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return err('Database not configured', 503);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const url = new URL(request.url);
  const rawLimit = parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 50 : rawLimit, 1), 200);
  const rawOffset = parseInt(url.searchParams.get('offset') || '0', 10);
  const offset = Math.max(Number.isNaN(rawOffset) ? 0 : rawOffset, 0);

  const { data, error, count } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('[admin/messages] supabase error', error);
    return err('Failed to fetch messages', 502);
  }

  return json({ data, count, limit, offset });
};

export const DELETE: APIRoute = async ({ request }) => clearSession(request);
