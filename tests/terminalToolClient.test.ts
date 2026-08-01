import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchCiteTool,
  fetchRetrieveTool,
  fetchTerminalTool,
  normalizeTerminalCacheKey,
  trimTerminalCache,
} from '../src/services/terminalToolClient';

const mockFetch = vi.fn();

afterEach(() => {
  mockFetch.mockReset();
  vi.unstubAllGlobals();
});

describe('terminal tool client', () => {
  it('normalizes cache keys and removes the oldest entries above the cap', () => {
    expect(normalizeTerminalCacheKey('  Intent Systems  ')).toBe('intent systems');

    const cache = new Map([
      ['first', 1],
      ['second', 2],
      ['third', 3],
    ]);
    trimTerminalCache(cache, 2);
    expect([...cache.keys()]).toEqual(['second', 'third']);
  });

  it('sends retrieve requests and filters malformed hits', async () => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          tool: 'retrieve',
          result: {
            query: 'intent systems',
            classification: 'projects',
            hits: [
              {
                id: 'intent-agent',
                source: 'workbench',
                title: 'Intent Recognition Agent',
                snippet: 'A retrieval-backed system.',
                score: 9,
              },
              { id: 'invalid' },
            ],
          },
        }),
        { status: 200 }
      )
    );

    const result = await fetchRetrieveTool('intent systems', undefined, 4);

    expect(result).toEqual({
      query: 'intent systems',
      classification: 'projects',
      hits: [
        {
          id: 'intent-agent',
          source: 'workbench',
          title: 'Intent Recognition Agent',
          snippet: 'A retrieval-backed system.',
          score: 9,
        },
      ],
    });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/tools',
      expect.objectContaining({ method: 'POST' })
    );
    expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
      tool: 'retrieve',
      input: { query: 'intent systems', limit: 4 },
      profileHandle: 'dessi',
    });
  });

  it('uses safe defaults for incomplete cite results and rejects mismatched responses', async () => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, tool: 'cite', result: { evidence: [] } }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true, tool: 'retrieve', result: {} }), { status: 200 })
      );

    await expect(fetchCiteTool('Dessi builds systems')).resolves.toEqual({
      claim: 'Dessi builds systems',
      verdict: 'unknown',
      evidence: [],
    });
    await expect(fetchCiteTool('Dessi builds systems')).resolves.toBeNull();
  });

  it('returns the raw response and an empty payload when a generic tool response is invalid JSON', async () => {
    vi.stubGlobal('fetch', mockFetch);
    const response = new Response('not json', { status: 502 });
    mockFetch.mockResolvedValue(response);

    await expect(fetchTerminalTool('list_projects')).resolves.toEqual({ response, payload: {} });
  });
});
