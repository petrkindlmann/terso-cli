import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

vi.mock('node:fs');
vi.mock('node:os', () => ({
  homedir: () => '/home/testuser',
}));

const mockedFs = vi.mocked(fs);

// Mock fetch globally for API connectivity check
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { Command } from 'commander';

async function importDoctor() {
  return await import('../../src/commands/doctor.js');
}

function buildProgram(register: (p: Command) => void): Command {
  const program = new Command();
  program.exitOverride();
  register(program);
  return program;
}

// ora spinner status symbols
const OK = '✔'; // ✔
const WARN = '⚠'; // ⚠
const FAIL = '✖'; // ✖

describe('doctor command', () => {
  let consoleLogs: string[];

  beforeEach(() => {
    consoleLogs = [];
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
    vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => {
      consoleLogs.push(args.join(' '));
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // ora spinners write directly to stdout/stderr (bypassing console.log).
    // Capture those writes too so doctor result lines are visible to assertions.
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown) => {
      consoleLogs.push(typeof chunk === 'string' ? chunk : String(chunk));
      return true;
    });
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk: unknown) => {
      consoleLogs.push(typeof chunk === 'string' ? chunk : String(chunk));
      return true;
    });
    mockFetch.mockReset();
  });

  it('registers "doctor" command on program', async () => {
    const { registerDoctorCommand } = await importDoctor();
    const program = new Command();
    registerDoctorCommand(program);

    const cmd = program.commands.find((c) => c.name() === 'doctor');
    expect(cmd).toBeDefined();
    expect(cmd!.description()).toBe(
      'Check Terso configuration, API connectivity, and file permissions'
    );
  });

  describe('check: global config', () => {
    it('reports OK when global config has apiUrl and apiKey', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes(path.join('.terso', 'config.json'))) return true;
        if (s.includes('project.json')) return true;
        if (s.includes(path.join('.terso', 'generated'))) return false;
        if (s.includes('.gitignore')) return false;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes(path.join('.terso', 'config.json'))) {
          return JSON.stringify({ apiUrl: 'https://omnus.dev', apiKey: 'sk-123' });
        }
        if (s.includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev', apiKey: 'sk-123' });
        }
        return '';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const globalConfigLine = consoleLogs.find((l) => l.includes('Global config'));
      expect(globalConfigLine).toContain(OK);
      expect(globalConfigLine).toContain('Found with API key');
    });

    it('reports WARN when global config has apiUrl but no apiKey', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes(path.join('.terso', 'config.json'))) return true;
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes(path.join('.terso', 'config.json'))) {
          return JSON.stringify({ apiUrl: 'https://omnus.dev' });
        }
        if (s.includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const globalConfigLine = consoleLogs.find((l) => l.includes('Global config'));
      expect(globalConfigLine).toContain(WARN);
      expect(globalConfigLine).toContain('no API key');
    });

    it('reports WARN when global config file does not exist', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.endsWith(path.join('.terso', 'config.json'))) return false;
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const globalConfigLine = consoleLogs.find((l) => l.includes('Global config'));
      expect(globalConfigLine).toContain(WARN);
    });
  });

  describe('check: project init', () => {
    it('reports OK when .terso/ directory exists', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.endsWith('.terso')) return true;
        if (s.includes('project.json')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        if (String(p).includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '{}';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const projectInitLine = consoleLogs.find((l) => l.includes('Project init'));
      expect(projectInitLine).toContain(OK);
    });

    it('reports FAIL when .terso/ does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue('{}');
      mockFetch.mockRejectedValue(new Error('fail'));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const projectInitLine = consoleLogs.find((l) => l.includes('Project init'));
      expect(projectInitLine).toContain(FAIL);
    });
  });

  describe('check: API connectivity', () => {
    it('reports OK when API is reachable', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        if (String(p).includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '{}';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const apiLine = consoleLogs.find((l) => l.includes('API connectivity'));
      expect(apiLine).toContain(OK);
      expect(apiLine).toContain('Connected to');
    });

    it('reports FAIL when API is not reachable', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        if (String(p).includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '{}';
      });
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const apiLine = consoleLogs.find((l) => l.includes('API connectivity'));
      expect(apiLine).toContain(FAIL);
      expect(apiLine).toContain('Cannot reach API');
    });
  });

  describe('check: gitignore', () => {
    it('reports OK when .gitignore contains generated/', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('.gitignore')) return true;
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('.gitignore')) return 'generated/\n';
        if (s.includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '{}';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const gitignoreLine = consoleLogs.find((l) => l.includes('Git ignore'));
      expect(gitignoreLine).toContain(OK);
    });

    it('reports WARN when .gitignore exists but does not exclude generated/', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('.gitignore')) return true;
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes('.gitignore')) return '*.log\n';
        if (s.includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev' });
        }
        return '{}';
      });
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const gitignoreLine = consoleLogs.find((l) => l.includes('Git ignore'));
      expect(gitignoreLine).toContain(WARN);
      expect(gitignoreLine).toContain('does not exclude generated/');
    });
  });

  describe('overall summary', () => {
    it('prints "All checks passed" when no failures', async () => {
      mockedFs.existsSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes(path.join('.terso', 'config.json'))) return true;
        if (s.includes('project.json')) return true;
        if (s.endsWith('.terso')) return true;
        if (s.includes('generated')) return true;
        if (s.includes('.gitignore')) return true;
        return false;
      });
      mockedFs.readFileSync.mockImplementation((p) => {
        const s = String(p);
        if (s.includes(path.join('.terso', 'config.json'))) {
          return JSON.stringify({ apiUrl: 'https://omnus.dev', apiKey: 'sk-123' });
        }
        if (s.includes('project.json')) {
          return JSON.stringify({ projectId: 'test', apiUrl: 'https://omnus.dev', apiKey: 'sk-123' });
        }
        if (s.includes('.gitignore')) return 'generated/\n';
        return '{}';
      });
      mockedFs.accessSync.mockReturnValue(undefined);
      mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const summaryLine = consoleLogs.find((l) => l.includes('All checks passed'));
      expect(summaryLine).toBeDefined();
    });

    it('prints fix prompt when there are failures', async () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockReturnValue('{}');
      mockFetch.mockRejectedValue(new Error('fail'));

      const { registerDoctorCommand } = await importDoctor();
      const program = buildProgram(registerDoctorCommand);
      await program.parseAsync(['doctor'], { from: 'user' });

      const fixLine = consoleLogs.find((l) => l.includes('Some checks failed'));
      expect(fixLine).toBeDefined();
    });
  });
});
