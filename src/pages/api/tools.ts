import type { APIRoute } from 'astro';
import { userConfig } from '../../config';
import { labNotes } from '../../config/labNotes';
import { networkNodes } from '../../config/network';
import { workbench } from '../../config/workbench';
import { toolSuccess } from '../../utils/apiContracts';
import { errorResponse, jsonResponse } from '../../utils/apiResponse';
import { parseToolCallInput } from '../../utils/requestSchemas';
import { retrieveKnowledge } from '../../utils/terminalKnowledge';
import { performWebVerify } from '../../utils/webVerify';

type ErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_TOOL_CALL'
  | 'INVALID_INPUT'
  | 'TIMEOUT'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

const err = (code: ErrorCode, message: string, status: number) =>
  errorResponse(code, message, status);

const APP_TARGETS: Record<string, string> = {
  projects: '/apps/projects',
  workbench: '/apps/projects',
  notes: '/apps/notes',
  resume: '/apps/resume',
  news: '/apps/news',
  network: '/apps/network',
  terminal: '/apps/terminal',
  desktop: '/desktop',
};

const asString = (value: unknown): string | null =>
  typeof value === 'string' ? value.trim() : null;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('INVALID_JSON', 'Invalid request format', 400);
  }

  const call = parseToolCallInput(body);
  if (!call) {
    return err(
      'INVALID_TOOL_CALL',
      'tool must be one of: local_context, web_verify, open_app, list_projects',
      400
    );
  }

  try {
    if (call.tool === 'local_context') {
      const query = asString(call.input?.query);
      const limitRaw = call.input?.limit;
      const limit =
        typeof limitRaw === 'number' && Number.isFinite(limitRaw)
          ? Math.max(1, Math.min(10, Math.floor(limitRaw)))
          : 5;
      if (!query || query.length < 2) {
        return err('INVALID_INPUT', 'local_context requires input.query (min 2 chars)', 400);
      }
      const hits = retrieveKnowledge(
        query,
        {
          user: userConfig,
          workbench,
          notes: labNotes,
          network: networkNodes,
        },
        limit
      ).map((hit) => ({
        source: hit.source,
        title: hit.title,
        snippet: hit.snippet,
        url: hit.url,
        score: hit.score,
      }));
      return jsonResponse(toolSuccess('local_context', { query, hits }), 200);
    }

    if (call.tool === 'web_verify') {
      const query = asString(call.input?.query);
      if (!query || query.length < 2) {
        return err('INVALID_INPUT', 'web_verify requires input.query (min 2 chars)', 400);
      }
      const result = await performWebVerify(query, 8000);
      return jsonResponse(
        toolSuccess('web_verify', {
          query,
          summary: result.summary,
          sources: result.sources,
        }),
        200
      );
    }

    if (call.tool === 'open_app') {
      const target = asString(call.input?.target)?.toLowerCase();
      if (!target) {
        return err('INVALID_INPUT', 'open_app requires input.target', 400);
      }
      const href = APP_TARGETS[target];
      if (!href) {
        return err('INVALID_INPUT', `Unknown app target "${target}"`, 400);
      }
      return jsonResponse(toolSuccess('open_app', { target, href }), 200);
    }

    const projects = workbench.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle,
      summary: item.summary,
      link: item.links.site ?? item.links.repo ?? item.links.article ?? item.links.demo ?? null,
    }));
    return jsonResponse(toolSuccess('list_projects', { count: projects.length, projects }), 200);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return err('TIMEOUT', 'Tool call timed out', 504);
    }
    if (error instanceof Error && error.message === 'UPSTREAM_ERROR') {
      return err('UPSTREAM_ERROR', 'Search provider request failed', 502);
    }
    return err('INTERNAL_ERROR', 'Unexpected tool execution error', 500);
  }
};
