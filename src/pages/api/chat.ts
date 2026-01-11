import type { APIRoute } from 'astro';

type ErrorCode =
  | 'CONFIG_ERROR'
  | 'INVALID_JSON'
  | 'INVALID_MESSAGES'
  | 'INVALID_RESPONSE'
  | 'AI_SERVICE_ERROR'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR';

const ts = () => new Date().toISOString();
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
const err = (code: ErrorCode, message: string, status: number) =>
  json({ code, message, timestamp: ts() }, status);

export const POST: APIRoute = async ({ request }) => {
  // Fast-fail if not configured
  if (!import.meta.env.OPENROUTER_API_KEY) {
    console.error('[Chat API] Missing OPENROUTER_API_KEY');
    return err('CONFIG_ERROR', 'Chat service is not configured. Please contact the site administrator.', 503);
  }

  // Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return err('INVALID_MESSAGES', 'Messages array is required and must not be empty', 400);
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321',
        'X-Title': import.meta.env.PUBLIC_SITE_NAME || 'DG-Labs OS',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chat API] OpenRouter error:', errorText);
      return err(
        'AI_SERVICE_ERROR',
        import.meta.env.DEV ? `AI service error: ${errorText}` : 'The AI service is temporarily unavailable',
        response.status || 500
      );
    }

    const completion = await response.json();
    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      console.error('[Chat API] Invalid response from OpenRouter');
      return err('INVALID_RESPONSE', 'Received invalid response from AI service', 500);
    }

    return json({ message: content }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('timeout')) {
      return err('TIMEOUT', 'Request timed out. Please try again.', 504);
    }

    console.error('[Chat API] Error:', message);
    return err(
      'INTERNAL_ERROR',
      import.meta.env.DEV ? message : 'An unexpected error occurred. Please try again later.',
      500
    );
  }
};
