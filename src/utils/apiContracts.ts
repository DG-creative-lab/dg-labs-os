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

export type VerifySource = {
  title: string;
  url: string;
  snippet: string;
};

export type VerifySuccessEnvelope = {
  ok: true;
  query: string;
  summary: string;
  sources: VerifySource[];
};

export type ToolSuccessEnvelope<T = unknown> = {
  ok: true;
  tool: string;
  result: T;
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

export const verifySuccess = (
  query: string,
  summary: string,
  sources: VerifySource[]
): VerifySuccessEnvelope => ({
  ok: true,
  query,
  summary,
  sources,
});

export const toolSuccess = <T>(tool: string, result: T): ToolSuccessEnvelope<T> => ({
  ok: true,
  tool,
  result,
});

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

export const isVerifySuccessEnvelope = (value: unknown): value is VerifySuccessEnvelope =>
  isRecord(value) &&
  value.ok === true &&
  typeof value.query === 'string' &&
  typeof value.summary === 'string' &&
  Array.isArray(value.sources) &&
  value.sources.every(
    (source) =>
      isRecord(source) &&
      typeof source.title === 'string' &&
      typeof source.url === 'string' &&
      typeof source.snippet === 'string'
  );

export const isToolSuccessEnvelope = (value: unknown): value is ToolSuccessEnvelope =>
  isRecord(value) && value.ok === true && typeof value.tool === 'string' && 'result' in value;

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
