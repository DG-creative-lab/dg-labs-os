export type ApiErrorEnvelope = {
  ok: false;
  code: string;
  message: string;
  error: string;
  timestamp: string;
};

export type HealthSuccessEnvelope = {
  ok: true;
};

export type ChatSuccessEnvelope = {
  ok: true;
  message: string;
};

export type AdminLoginSuccessEnvelope = {
  ok: true;
  success: true;
};

export type AdminMessagesSuccessEnvelope<T = unknown> = {
  ok: true;
  data: T[];
  count: number | null;
  limit: number;
  offset: number;
};

export const healthSuccess = (): HealthSuccessEnvelope => ({ ok: true });

export const chatSuccess = (message: string): ChatSuccessEnvelope => ({ ok: true, message });

export const adminLoginSuccess = (): AdminLoginSuccessEnvelope => ({ ok: true, success: true });

export const adminMessagesSuccess = <T>(
  data: T[],
  count: number | null,
  limit: number,
  offset: number
): AdminMessagesSuccessEnvelope<T> => ({ ok: true, data, count, limit, offset });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export const isApiErrorEnvelope = (value: unknown): value is ApiErrorEnvelope =>
  isRecord(value) &&
  value.ok === false &&
  typeof value.code === 'string' &&
  typeof value.message === 'string' &&
  typeof value.error === 'string' &&
  typeof value.timestamp === 'string';

export const isHealthSuccessEnvelope = (value: unknown): value is HealthSuccessEnvelope =>
  isRecord(value) && value.ok === true;

export const isChatSuccessEnvelope = (value: unknown): value is ChatSuccessEnvelope =>
  isRecord(value) && value.ok === true && typeof value.message === 'string';

export const isAdminLoginSuccessEnvelope = (value: unknown): value is AdminLoginSuccessEnvelope =>
  isRecord(value) && value.ok === true && value.success === true;

export const isAdminMessagesSuccessEnvelope = (
  value: unknown
): value is AdminMessagesSuccessEnvelope =>
  isRecord(value) &&
  value.ok === true &&
  Array.isArray(value.data) &&
  (typeof value.count === 'number' || value.count === null) &&
  typeof value.limit === 'number' &&
  typeof value.offset === 'number';
