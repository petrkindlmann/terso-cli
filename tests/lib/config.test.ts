import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

vi.mock('node:fs');
vi.mock('node:os');

const mockedFs = vi.mocked(fs);
const mockedOs = vi.mocked(os);

// Dynamic import to apply mocks before module loads
async function importConfig() {
  return await import('../../src/lib/config.js');
}

describe('loadGlobalConfig', () => {
  beforeEach(() => {
    mockedOs.homedir.mockReturnValue('/home/testuser');
  });

  it('returns empty object when config file does not exist', async () => {
    mockedFs.existsSync.mockReturnValue(false);

    const { loadGlobalConfig } = await importConfig();
    const result = loadGlobalConfig();

    expect(result).toEqual({});
    expect(mockedFs.existsSync).toHaveBeenCalledWith(
      path.join('/home/testuser', '.terso', 'config.json')
    );
  });

  it('returns parsed config when file exists and is valid JSON', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ apiUrl: 'https://omnus.dev', apiKey: 'sk-test-123' })
    );

    const { loadGlobalConfig } = await importConfig();
    const result = loadGlobalConfig();

    expect(result).toEqual({ apiUrl: 'https://omnus.dev', apiKey: 'sk-test-123' });
  });

  it('returns empty object when file contains invalid JSON', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not valid json {{{');

    const { loadGlobalConfig } = await importConfig();
    const result = loadGlobalConfig();

    expect(result).toEqual({});
  });

  it('returns partial config when only apiUrl is set', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ apiUrl: 'http://localhost:3000' }));

    const { loadGlobalConfig } = await importConfig();
    const result = loadGlobalConfig();

    expect(result).toEqual({ apiUrl: 'http://localhost:3000' });
    expect(result.apiKey).toBeUndefined();
  });
});

describe('loadProjectConfig', () => {
  beforeEach(() => {
    mockedOs.homedir.mockReturnValue('/home/testuser');
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
  });

  it('throws when .terso/project.json does not exist', async () => {
    mockedFs.existsSync.mockReturnValue(false);

    const { loadProjectConfig } = await importConfig();

    expect(() => loadProjectConfig()).toThrow(
      'No .terso/project.json found. Run `terso init` to initialize this project.'
    );
  });

  it('throws when project.json contains invalid JSON', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      if (String(p).includes('project.json')) return true;
      return false;
    });
    mockedFs.readFileSync.mockReturnValue('broken json !!!');

    const { loadProjectConfig } = await importConfig();

    expect(() => loadProjectConfig()).toThrow('Failed to parse .terso/project.json');
  });

  it('throws when projectId is missing', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      if (String(p).includes('project.json')) return true;
      return false;
    });
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ apiUrl: 'http://localhost:3000' }));

    const { loadProjectConfig } = await importConfig();

    expect(() => loadProjectConfig()).toThrow('Missing or invalid projectId');
  });

  it('returns merged config with project overriding global', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes('project.json')) return true;
      if (pathStr.includes(path.join('/home/testuser', '.terso', 'config.json'))) return true;
      return false;
    });

    mockedFs.readFileSync.mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes('project.json')) {
        return JSON.stringify({
          projectId: 'my-app',
          apiUrl: 'https://omnus.dev',
          detectedFrom: 'package.json',
          createdAt: '2026-01-01T00:00:00.000Z',
        });
      }
      if (pathStr.includes(path.join('.terso', 'config.json'))) {
        return JSON.stringify({
          apiUrl: 'http://global-url:3000',
          apiKey: 'global-key-123',
        });
      }
      return '';
    });

    const { loadProjectConfig } = await importConfig();
    const result = loadProjectConfig();

    expect(result.projectId).toBe('my-app');
    // Project apiUrl should override global
    expect(result.apiUrl).toBe('https://omnus.dev');
    // apiKey comes from global since project has none
    expect(result.apiKey).toBe('global-key-123');
    expect(result.detectedFrom).toBe('package.json');
  });

  it('uses default apiUrl when neither project nor global has one', async () => {
    mockedFs.existsSync.mockImplementation((p) => {
      if (String(p).includes('project.json')) return true;
      return false;
    });
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ projectId: 'my-app' }));

    const { loadProjectConfig } = await importConfig();
    const result = loadProjectConfig();

    expect(result.apiUrl).toBe('https://omnus.dev');
  });
});

describe('saveGlobalConfig', () => {
  beforeEach(() => {
    mockedOs.homedir.mockReturnValue('/home/testuser');
  });

  it('creates config directory and writes config file', async () => {
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);

    const { saveGlobalConfig } = await importConfig();
    saveGlobalConfig({ apiUrl: 'https://omnus.dev', apiKey: 'sk-test' });

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      path.join('/home/testuser', '.terso'),
      { recursive: true }
    );

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join('/home/testuser', '.terso', 'config.json'),
      JSON.stringify({ apiUrl: 'https://omnus.dev', apiKey: 'sk-test' }, null, 2) + '\n'
    );
  });

  it('writes empty config when given empty object', async () => {
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);

    const { saveGlobalConfig } = await importConfig();
    saveGlobalConfig({});

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      path.join('/home/testuser', '.terso', 'config.json'),
      '{}\n'
    );
  });
});
