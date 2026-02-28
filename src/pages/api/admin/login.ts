import type { APIRoute } from 'astro';
import {
  createAdminSessionToken,
  getAdminSessionSecret,
  safeCredentialMatch,
} from '../../../utils/adminAuth';
import { adminLoginSuccess } from '../../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../../utils/apiResponse';
import { parseAdminLoginInput } from '../../../utils/requestSchemas';
import { getServerEnv } from '../../../utils/serverEnv';

export const POST: APIRoute = async ({ request }) => {
  const ADMIN_USERNAME = getServerEnv('ADMIN_USERNAME');
  const ADMIN_PASSWORD = getServerEnv('ADMIN_PASSWORD');
  const ADMIN_SESSION_SECRET = getAdminSessionSecret();

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_SESSION_SECRET) {
    return errorResponse('CONFIG_ERROR', 'Admin credentials not configured', 503, true);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse('INVALID_JSON', 'Invalid JSON', 400, true);
  }

  const credentials = parseAdminLoginInput(body);
  if (!credentials) {
    return errorResponse('INVALID_CREDENTIALS', 'Invalid credentials', 401, true);
  }
  const { username, password } = credentials;

  const usernameMatch = safeCredentialMatch(username, ADMIN_USERNAME);
  const passwordMatch = safeCredentialMatch(password, ADMIN_PASSWORD);
  if (usernameMatch && passwordMatch) {
    const token = createAdminSessionToken(username, ADMIN_SESSION_SECRET);
    const isSecure = new URL(request.url).protocol === 'https:';
    const securePart = isSecure ? ' Secure;' : '';
    const response = jsonResponse(adminLoginSuccess(), 200, true);
    response.headers.append(
      'Set-Cookie',
      `admin_session=${token}; HttpOnly;${securePart} SameSite=Lax; Path=/; Max-Age=28800`
    );
    return response;
  }

  return errorResponse('INVALID_CREDENTIALS', 'Invalid credentials', 401, true);
};
