import type { APIRoute } from 'astro';
import { errorResponse } from '../../../utils/apiResponse';
import { parseChatRequestInput } from '../../../utils/requestSchemas';
import { runChatStreamService, type ChatServiceErrorCode } from '../../../services/chatService';

type ErrorCode = 'INVALID_JSON' | 'INVALID_MESSAGES' | ChatServiceErrorCode;

const err = (code: ErrorCode, message: string, status: number, meta?: Record<string, unknown>) =>
  errorResponse(code, message, status, false, meta);

const toSseChunk = (event: string, payload: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  const parsed = parseChatRequestInput(body);
  if (!parsed) {
    return err('INVALID_MESSAGES', 'Messages array is required and must not be empty', 400);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, payload: unknown) => {
        controller.enqueue(encoder.encode(toSseChunk(event, payload)));
      };

      try {
        send('status', { stage: 'accepted', message: 'Starting request…' });
        send('status', {
          stage: parsed.responseMode === 'agent_json' ? 'assemble' : 'grounding',
          message:
            parsed.responseMode === 'agent_json'
              ? 'Shaping structured response…'
              : 'Gathering local context…',
        });

        if (parsed.responseMode !== 'agent_json') {
          send('status', { stage: 'provider', message: `Thinking with ${parsed.provider}…` });
        }

        const streamResult = await runChatStreamService(parsed);
        if (!streamResult.ok) {
          send('error', {
            ok: false,
            code: streamResult.code,
            message: streamResult.message,
            meta: streamResult.meta,
            status: streamResult.status,
          });
          send('done', { ok: false });
          controller.close();
          return;
        }

        if ('stream' in streamResult) {
          for await (const event of streamResult.stream) {
            if (event.type === 'status') {
              send('status', event);
              continue;
            }
            if (event.type === 'delta') {
              send('delta', event);
              continue;
            }
            if (event.type === 'error') {
              send('error', {
                ok: false,
                code: event.code,
                message: event.message,
                meta: event.meta,
                status: event.status,
              });
              send('done', { ok: false });
              controller.close();
              return;
            }
            if (event.type === 'result') {
              send('result', event.payload);
            }
          }
          send('done', { ok: true });
          controller.close();
          return;
        }

        send('result', streamResult.payload);
        send('done', { ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Streaming request failed.';
        send('error', {
          ok: false,
          code: 'PROVIDER_ERROR',
          message,
          status: 500,
        });
        send('done', { ok: false });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
};
