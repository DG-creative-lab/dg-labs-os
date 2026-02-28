type ApiErrorBody = {
  ok: false;
  code: string;
  message: string;
  error: string;
  timestamp: string;
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
  noStore = false
): Response =>
  jsonResponse(
    {
      ok: false,
      code,
      message,
      // Backward-compatible alias used by some callers.
      error: message,
      timestamp: now(),
    } satisfies ApiErrorBody,
    status,
    noStore
  );
