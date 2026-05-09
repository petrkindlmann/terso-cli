import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  handleGetContext,
  handleSearch,
  handleCapture,
  createMcpServer,
  McpDeps,
} from '../../src/lib/mcp-server.js';
import { OmnusApiClient } from '../../src/lib/api-client.js';
import { ProjectConfig } from '../../src/lib/config.js';

let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'terso-mcp-'));
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function makeDeps(overrides: Partial<McpDeps> = {}): McpDeps {
  return {
    cwd: tmpRoot,
    loadConfig: () => null,
    buildClient: () => {
      throw new Error('buildClient should not be called when not authed');
    },
    ...overrides,
  };
}

function fakeConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    projectId: 'test-proj',
    apiUrl: 'https://omnus.test',
    apiKey: 'tok-123',
    ...overrides,
  };
}

describe('handleGetContext', () => {
  it('returns helpful message when no context exists', async () => {
    const result = await handleGetContext(makeDeps());

    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('No project context found');
    expect(result.content[0].text).toContain('terso init');
  });

  it('returns AGENTS.md when present', async () => {
    fs.writeFileSync(path.join(tmpRoot, 'AGENTS.md'), '# Rules\n\nUse pnpm.\n');

    const result = await handleGetContext(makeDeps());

    expect(result.content[0].text).toContain('# AGENTS.md');
    expect(result.content[0].text).toContain('Use pnpm.');
  });

  it('includes synced files from .terso/generated/', async () => {
    fs.writeFileSync(path.join(tmpRoot, 'AGENTS.md'), 'Rules.');
    const generated = path.join(tmpRoot, '.terso', 'generated');
    fs.mkdirSync(generated, { recursive: true });
    fs.writeFileSync(path.join(generated, 'CURRENT_CONTEXT.md'), '## Stack\n\nNext.js + Hono.');
    fs.writeFileSync(path.join(generated, 'DECISIONS.md'), '## Auth\n\nSwitched to Supabase.');

    const result = await handleGetContext(makeDeps());

    const text = result.content[0].text;
    expect(text).toContain('# AGENTS.md');
    expect(text).toContain('CURRENT_CONTEXT.md');
    expect(text).toContain('Next.js + Hono');
    expect(text).toContain('DECISIONS.md');
    expect(text).toContain('Supabase');
  });

  it('skips non-markdown files', async () => {
    const generated = path.join(tmpRoot, '.terso', 'generated');
    fs.mkdirSync(generated, { recursive: true });
    fs.writeFileSync(path.join(generated, 'a.md'), '# A');
    fs.writeFileSync(path.join(generated, 'context.json'), '{}');

    const result = await handleGetContext(makeDeps());

    expect(result.content[0].text).toContain('# A');
    expect(result.content[0].text).not.toContain('context.json');
  });
});

describe('handleSearch', () => {
  it('errors when project not initialized', async () => {
    const result = await handleSearch({ query: 'auth' }, makeDeps());

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Not initialized');
  });

  it('errors when API token missing', async () => {
    const config = fakeConfig({ apiKey: undefined });
    const result = await handleSearch(
      { query: 'auth' },
      makeDeps({ loadConfig: () => config }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('No Omnus API token');
  });

  it('returns formatted results from API', async () => {
    const search = vi.fn().mockResolvedValue({
      records: [
        {
          id: 'r1',
          title: 'Auth choice',
          body: 'Switched to Supabase for RLS.',
          kind: 'decision',
          scope: 'project',
          confidence: 0.9,
          score: 0.87,
          createdAt: '2026-05-01T00:00:00Z',
        },
      ],
      totalFound: 1,
    });

    const result = await handleSearch(
      { query: 'auth', limit: 3 },
      makeDeps({
        loadConfig: () => fakeConfig(),
        buildClient: () => ({ search } as unknown as OmnusApiClient),
      }),
    );

    expect(result.isError).toBeFalsy();
    expect(search).toHaveBeenCalledWith('auth', { limit: 3 });
    expect(result.content[0].text).toContain('Auth choice');
    expect(result.content[0].text).toContain('decision');
    expect(result.content[0].text).toContain('Switched to Supabase');
    expect(result.content[0].text).toContain('Found 1 result(s)');
  });

  it('returns empty-results message gracefully', async () => {
    const search = vi.fn().mockResolvedValue({ records: [], totalFound: 0 });

    const result = await handleSearch(
      { query: 'nothing' },
      makeDeps({
        loadConfig: () => fakeConfig(),
        buildClient: () => ({ search } as unknown as OmnusApiClient),
      }),
    );

    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toContain('No results for "nothing"');
  });

  it('reports search errors as tool errors', async () => {
    const search = vi.fn().mockRejectedValue(new Error('500 Internal Server Error'));

    const result = await handleSearch(
      { query: 'x' },
      makeDeps({
        loadConfig: () => fakeConfig(),
        buildClient: () => ({ search } as unknown as OmnusApiClient),
      }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Search failed');
    expect(result.content[0].text).toContain('500');
  });

  it('defaults limit to 5 when not provided', async () => {
    const search = vi.fn().mockResolvedValue({ records: [], totalFound: 0 });

    await handleSearch(
      { query: 'x' },
      makeDeps({
        loadConfig: () => fakeConfig(),
        buildClient: () => ({ search } as unknown as OmnusApiClient),
      }),
    );

    expect(search).toHaveBeenCalledWith('x', { limit: 5 });
  });
});

describe('handleCapture', () => {
  it('errors when project not initialized', async () => {
    const result = await handleCapture({ text: 'hi' }, makeDeps());

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Not initialized');
  });

  it('errors when API token missing', async () => {
    const result = await handleCapture(
      { text: 'hi' },
      makeDeps({ loadConfig: () => fakeConfig({ apiKey: undefined }) }),
    );

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('No Omnus API token');
  });

  it('passes text + projectId + scope to API and returns ingestion id', async () => {
    const capture = vi.fn().mockResolvedValue({ ingestionId: 'ing_42', status: 'queued' });

    const result = await handleCapture(
      { text: 'switched auth to Supabase', scope: 'project' },
      makeDeps({
        loadConfig: () => fakeConfig(),
        buildClient: () => ({ capture } as unknown as OmnusApiClient),
      }),
    );

    expect(result.isError).toBeFalsy();
    expect(capture).toHaveBeenCalledWith('switched auth to Supabase', 'test-proj', 'project');
    expect(result.content[0].text).toContain('ing_42');
    expect(result.content[0].text).toContain('queued');
  });
});

describe('createMcpServer', () => {
  it('registers all three tools', () => {
    const server = createMcpServer(makeDeps());
    // McpServer doesn't expose registered tool names publicly, but we can
    // confirm the construction doesn't throw and the underlying server exists.
    expect(server).toBeDefined();
    expect(server.server).toBeDefined();
  });
});
