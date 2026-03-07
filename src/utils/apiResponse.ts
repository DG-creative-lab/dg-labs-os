type ApiErrorBody = {
  ok: false;
  code: string;
  message: string;
  error: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

const now = () => new Date().toISOString();

export const jsonResponse = (data: unknown, status = 200, noStore = false): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(noStore ? { 'Cache-Control': 'no-store' } : {}),
    },
  });

export const errorResponse = (
  code: string,
  message: string,
  status: number,
  noStore = false,
  meta?: Record<string, unknown>
): Response =>
  jsonResponse(
    {
      ok: false,
      code,
      message,
      // Backward-compatible alias used by some callers.
      error: message,
      timestamp: now(),
      ...(meta ? { meta } : {}),
    } satisfies ApiErrorBody,
    status,
    noStore
  );
