import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { getAdminSessionSecret, verifyAdminSessionToken } from '../../../utils/adminAuth';
import { adminMessagesSuccess, healthSuccess } from '../../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../../utils/apiResponse';
import { getServerEnv } from '../../../utils/serverEnv';

const err = (code: string, message: string, status = 400) =>
  errorResponse(code, message, status, true);

const clearSession = (request: Request) => {
  const isSecure = new URL(request.url).protocol === 'https:';
  const securePart = isSecure ? ' Secure;' : '';
  const response = jsonResponse(healthSuccess(), 200, true);
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
    return err('UNAUTHORIZED', 'Unauthorized', 401);
  }

  const SUPABASE_URL = getServerEnv('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = getServerEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return err('CONFIG_ERROR', 'Database not configured', 503);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const url = new URL(request.url);
  const rawLimit = parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 50 : rawLimit, 1), 200);
  const rawOffset = parseInt(url.searchParams.get('offset') || '0', 10);
  const offset = Math.max(Number.isNaN(rawOffset) ? 0 : rawOffset, 0);

  try {
    const { data, error, count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[admin/messages] supabase error', error);
      return err('UPSTREAM_ERROR', 'Failed to fetch messages', 502);
    }

    return jsonResponse(adminMessagesSuccess(data ?? [], count ?? null, limit, offset), 200, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[admin/messages] unexpected error', message);
    return err('INTERNAL_ERROR', 'Unexpected error. Please try again later.', 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => clearSession(request);
