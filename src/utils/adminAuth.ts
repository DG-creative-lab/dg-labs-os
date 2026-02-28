import { createHmac, timingSafeEqual } from 'node:crypto';

type AdminSessionPayload = {
  u: string;
  iat: number;
  exp: number;
};

const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const toBase64Url = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');
const fromBase64Url = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload: string, secret: string): string =>
  createHmac('sha256', secret).update(payload).digest('base64url');

const safeEqual = (a: string, b: string): boolean => {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};

export const getAdminSessionSecret = (): string | null => {
  const explicit = import.meta.env.ADMIN_SESSION_SECRET as string | undefined;
  const fallback = import.meta.env.ADMIN_PASSWORD as string | undefined;
  return explicit || fallback || null;
};

export const createAdminSessionToken = (username: string, secret: string): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    u: username,
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SECONDS,
  };
  const payloadEncoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
};

export const verifyAdminSessionToken = (
  token: string,
  secret: string
): AdminSessionPayload | null => {
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  const expected = sign(payloadEncoded, secret);
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded)) as AdminSessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.u || typeof payload.u !== 'string') return null;
    if (typeof payload.exp !== 'number' || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
};

export const safeCredentialMatch = (provided: string, expected: string): boolean =>
  safeEqual(provided, expected);
