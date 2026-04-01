import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();

// Replace global fetch before importing the module
vi.stubGlobal('fetch', mockFetch);

async function importApiClient() {
  return await import('../../src/lib/api-client.js');
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
  });
}

function textResponse(text: string, status = 200) {
  return new Response(text, {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'text/plain' },
  });
}

describe('OmnusApiClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    it('strips trailing slash from base URL', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev/', 'sk-test');

      mockFetch.mockResolvedValueOnce(textResponse('ok'));
      await client.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://omnus.dev/api/health',
        expect.any(Object)
      );
    });
  });

  describe('headers', () => {
    it('includes Authorization header when apiKey is provided', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test-key');

      mockFetch.mockResolvedValueOnce(textResponse('ok'));
      await client.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key',
            'User-Agent': 'terso-cli/0.1.0',
          }),
        })
      );
    });

    it('omits Authorization header when no apiKey', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockResolvedValueOnce(textResponse('ok'));
      await client.healthCheck();

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders).not.toHaveProperty('Authorization');
    });
  });

  describe('exportContext', () => {
    it('fetches context for a project', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test');

      const mockData = {
        files: { 'ARCHITECTURE.md': '# Architecture' },
        metadata: {
          project_id: 'my-project',
          generated_at: '2026-03-15T00:00:00Z',
          file_count: 1,
          total_tokens: 100,
        },
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockData));

      const result = await client.exportContext('my-project');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://omnus.dev/api/projects/my-project/export-context',
        expect.objectContaining({ method: 'POST' })
      );
      expect(Object.keys(result.files)).toHaveLength(1);
      expect(result.files['ARCHITECTURE.md']).toBe('# Architecture');
    });

    it('includes force query param when requested', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test');

      mockFetch.mockResolvedValueOnce(jsonResponse({ files: [] }));

      await client.exportContext('my-project', { force: true });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://omnus.dev/api/projects/my-project/export-context?force=true',
        expect.any(Object)
      );
    });

    it('encodes project ID in URL', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test');

      mockFetch.mockResolvedValueOnce(jsonResponse({ files: [] }));

      await client.exportContext('project with spaces');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://omnus.dev/api/projects/project%20with%20spaces/export-context',
        expect.any(Object)
      );
    });
  });

  describe('capture', () => {
    it('sends capture request with text', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test');

      const mockResponse = { ingestionId: 'ing-123', status: 'queued' };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockResponse));

      const result = await client.capture('some knowledge fragment', 'my-project', 'shared');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://omnus.dev/api/ingestions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            sourceType: 'manual_paste',
            text: 'some knowledge fragment',
            projectHint: 'my-project',
            scopeHint: 'shared',
          }),
        })
      );
      expect(result.ingestionId).toBe('ing-123');
      expect(result.status).toBe('queued');
    });

    it('omits optional fields when not provided', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockResolvedValueOnce(
        jsonResponse({ ingestionId: 'ing-456', status: 'queued' })
      );

      await client.capture('bare text');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ sourceType: 'manual_paste', text: 'bare text' });
      expect(body.projectHint).toBeUndefined();
      expect(body.scopeHint).toBeUndefined();
    });
  });

  describe('search', () => {
    it('sends search query with options', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test');

      const mockResponse = {
        records: [
          {
            id: 'frag-1',
            title: 'Deploy recipe',
            body: 'How to deploy',
            kind: 'procedure',
            scope: 'shared',
            confidence: 0.92,
            score: 0.95,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
        totalFound: 1,
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockResponse));

      const result = await client.search('deploy', { scope: 'shared', limit: 5 });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ query: 'deploy', scope: 'shared', limit: 5 });
      expect(result.records).toHaveLength(1);
      expect(result.records[0].title).toBe('Deploy recipe');
    });

    it('sends minimal search with just query', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockResolvedValueOnce(jsonResponse({ records: [], totalFound: 0 }));

      await client.search('anything');

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ query: 'anything' });
    });
  });

  describe('getStatus', () => {
    it('fetches project status', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev', 'sk-test');

      const mockStatus = {
        fragmentCount: 42,
        lastIngestion: '2026-03-14T12:00:00Z',
        lastExport: '2026-03-14T13:00:00Z',
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(mockStatus));

      const result = await client.getStatus('my-project');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://omnus.dev/api/projects/my-project',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result.fragmentCount).toBe(42);
    });
  });

  describe('healthCheck', () => {
    it('resolves when API returns 200', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockResolvedValueOnce(textResponse('ok'));

      await expect(client.healthCheck()).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws on non-OK HTTP response', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockResolvedValueOnce(
        new Response('Forbidden', {
          status: 403,
          statusText: 'Forbidden',
          headers: { 'content-type': 'text/plain' },
        })
      );

      await expect(client.healthCheck()).rejects.toThrow('API error 403: Forbidden');
    });

    it('includes response body text in error message', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockResolvedValueOnce(
        new Response('{"error":"Invalid API key"}', {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'content-type': 'text/plain' },
        })
      );

      await expect(client.healthCheck()).rejects.toThrow(
        'API error 401: Unauthorized - {"error":"Invalid API key"}'
      );
    });

    it('throws on network error', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockRejectedValueOnce(new Error('fetch failed'));

      await expect(client.healthCheck()).rejects.toThrow(
        'Network error connecting to https://omnus.dev: fetch failed'
      );
    });

    it('handles non-Error network errors', async () => {
      const { OmnusApiClient } = await importApiClient();
      const client = new OmnusApiClient('https://omnus.dev');

      mockFetch.mockRejectedValueOnce('string error');

      await expect(client.healthCheck()).rejects.toThrow(
        'Network error connecting to https://omnus.dev: Unknown network error'
      );
    });
  });
});
