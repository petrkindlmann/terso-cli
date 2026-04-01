import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';

vi.mock('node:fs');
vi.mock('node:child_process');

const mockedFs = vi.mocked(fs);
const mockedExecSync = vi.mocked(execSync);

async function importProjectDetector() {
  return await import('../../src/lib/project-detector.js');
}

describe('detectProject', () => {
  beforeEach(() => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedExecSync.mockImplementation(() => {
      throw new Error('Not a git repo');
    });
  });

  describe('git remote detection', () => {
    it('detects project name from HTTPS remote URL', async () => {
      mockedExecSync.mockReturnValue('https://github.com/petrkindlmann/omnus.git\n');

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/omnus');

      expect(result).toEqual({ name: 'omnus', source: 'git-remote' });
    });

    it('detects project name from SSH remote URL', async () => {
      mockedExecSync.mockReturnValue('git@github.com:petrkindlmann/my-project.git\n');

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/my-project');

      expect(result).toEqual({ name: 'my-project', source: 'git-remote' });
    });

    it('strips .git suffix from remote URL', async () => {
      mockedExecSync.mockReturnValue('https://github.com/user/repo.git\n');

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/repo');

      expect(result).toEqual({ name: 'repo', source: 'git-remote' });
    });

    it('handles remote URL without .git suffix', async () => {
      mockedExecSync.mockReturnValue('https://github.com/user/repo\n');

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/repo');

      expect(result).toEqual({ name: 'repo', source: 'git-remote' });
    });

    it('handles GitLab-style nested URLs', async () => {
      mockedExecSync.mockReturnValue('git@gitlab.com:group/subgroup/repo.git\n');

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/repo');

      expect(result).toEqual({ name: 'repo', source: 'git-remote' });
    });
  });

  describe('package.json detection', () => {
    it('detects project name from package.json', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'my-awesome-app' }));

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/my-awesome-app');

      expect(result).toEqual({ name: 'my-awesome-app', source: 'package.json' });
    });

    it('strips npm scope from package name', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ name: '@petrkindlmann/terso-cli' }));

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/terso-cli');

      expect(result).toEqual({ name: 'terso-cli', source: 'package.json' });
    });

    it('falls through when package.json has no name field', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.0.0' }));

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/fallback-dir');

      expect(result).toEqual({ name: 'fallback-dir', source: 'directory-name' });
    });

    it('falls through when package.json is invalid JSON', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/broken-pkg');

      expect(result).toEqual({ name: 'broken-pkg', source: 'directory-name' });
    });
  });

  describe('directory name fallback', () => {
    it('uses directory basename when no git remote or package.json', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      mockedFs.existsSync.mockReturnValue(false);

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/home/user/projects/side-hustle');

      expect(result).toEqual({ name: 'side-hustle', source: 'directory-name' });
    });

    it('handles root-like directory path', async () => {
      mockedExecSync.mockImplementation(() => {
        throw new Error('Not a git repo');
      });
      mockedFs.existsSync.mockReturnValue(false);

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/myproject');

      expect(result).toEqual({ name: 'myproject', source: 'directory-name' });
    });
  });

  describe('priority order', () => {
    it('prefers package.json over git remote', async () => {
      mockedExecSync.mockReturnValue('https://github.com/user/git-name.git\n');
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue(JSON.stringify({ name: 'pkg-name' }));

      const { detectProject } = await importProjectDetector();
      const result = detectProject('/projects/dir-name');

      expect(result.name).toBe('pkg-name');
      expect(result.source).toBe('package.json');
    });
  });
});
