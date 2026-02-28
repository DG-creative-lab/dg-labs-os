import type { APIRoute } from 'astro';
import {
  createAdminSessionToken,
  getAdminSessionSecret,
  safeCredentialMatch,
} from '../../../utils/adminAuth';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });

export const POST: APIRoute = async ({ request }) => {
  const ADMIN_USERNAME = import.meta.env.ADMIN_USERNAME as string | undefined;
  const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD as string | undefined;
  const ADMIN_SESSION_SECRET = getAdminSessionSecret();

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    return json({ error: 'Admin credentials not configured' }, 503);
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { username, password } = body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return json({ error: 'Invalid credentials' }, 401);
  }

  const usernameMatch = safeCredentialMatch(username, ADMIN_USERNAME);
  const passwordMatch = safeCredentialMatch(password, ADMIN_PASSWORD);
  if (usernameMatch && passwordMatch) {
    const token = createAdminSessionToken(username, ADMIN_SESSION_SECRET);
    const isSecure = new URL(request.url).protocol === 'https:';
    const securePart = isSecure ? ' Secure;' : '';
    const response = json({ success: true });
    response.headers.append(
      'Set-Cookie',
      `admin_session=${token}; HttpOnly;${securePart} SameSite=Lax; Path=/; Max-Age=28800`
    );
    return response;
  }

  return json({ error: 'Invalid credentials' }, 401);
};
