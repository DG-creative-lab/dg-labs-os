import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { healthSuccess } from '../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseContactInput } from '../../utils/requestSchemas';
import { getServerEnv } from '../../utils/serverEnv';

const bad = (code: string, message: string, status = 400) => errorResponse(code, message, status);

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad('INVALID_JSON', 'Invalid JSON', 400);
  }

  const parsed = parseContactInput(body);
  if (!parsed) return bad('INVALID_FIELDS', 'Invalid field types', 400);
  const { name, email, message, company, t } = parsed;

  // Basic validations
  if (!name || !email || !message) return bad('MISSING_FIELDS', 'Missing required fields', 400);
  if (!/.+@.+\..+/.test(email)) return bad('INVALID_EMAIL', 'Invalid email', 400);
  if (company && String(company).trim() !== '') return bad('SPAM', 'Spam detected', 400); // honeypot
  if (typeof t === 'number' && t < 5)
    return bad('RATE_LIMIT', 'Too fast. Please take a moment before sending.', 429);

  const SUPABASE_URL = getServerEnv('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = getServerEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return bad(
      'UNCONFIGURED',
      'Contact database is not configured. Use the email link instead.',
      503
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const headers = request.headers;
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('cf-connecting-ip') ||
    'unknown';
  const userAgent = headers.get('user-agent') || 'unknown';

  try {
    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      message,
      time_on_page: typeof t === 'number' ? t : null,
      ip,
      user_agent: userAgent,
    });

    if (error) {
      console.error('[contact] supabase insert error', error);
      return bad('UPSTREAM_ERROR', 'Failed to save message. Please try again later.', 502);
    }

    return jsonResponse(healthSuccess(), 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[contact] Error', message);
    return bad('INTERNAL_ERROR', 'Unexpected error. Please try again later.', 500);
  }
};

export const GET: APIRoute = async () => jsonResponse(healthSuccess(), 200);
