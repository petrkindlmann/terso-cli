import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

vi.mock('node:fs');
vi.mock('node:os', () => ({
  homedir: () => '/home/testuser',
}));
vi.mock('node:child_process');

// Mock the API client used by init for project verification
vi.mock('../../src/lib/api-client.js', () => ({
  OmnusApiClient: vi.fn().mockImplementation(() => ({
    verifyProject: vi.fn().mockResolvedValue(null),
  })),
}));

const mockedFs = vi.mocked(fs);

import { Command } from 'commander';

async function importInit() {
  return await import('../../src/commands/init.js');
}

function buildProgram(register: (p: Command) => void): Command {
  const program = new Command();
  program.exitOverride(); // Throw instead of calling process.exit
  register(program);
  return program;
}

describe('init command', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Default: no existing .terso directory, no global config
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);
    mockedFs.readFileSync.mockReturnValue('{}');
  });

  it('registers "init" command on program', async () => {
    const { registerInitCommand } = await importInit();
    const program = new Command();
    registerInitCommand(program);

    const initCmd = program.commands.find((c) => c.name() === 'init');
    expect(initCmd).toBeDefined();
    expect(initCmd!.description()).toBe('Initialize Terso in the current project directory');
  });

  it('creates .terso/ and .terso/generated/ directories', async () => {
    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init'], { from: 'user' });

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      path.join('/projects/my-app', '.terso', 'generated'),
      { recursive: true }
    );
  });

  it('writes project.json with detected project info', async () => {
    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init'], { from: 'user' });

    const projectJsonCall = mockedFs.writeFileSync.mock.calls.find(
      (call) => String(call[0]).includes('project.json')
    );
    expect(projectJsonCall).toBeDefined();

    const written = JSON.parse(projectJsonCall![1] as string);
    expect(written.projectId).toBeDefined();
    expect(written.apiUrl).toBe('http://localhost:3000');
    expect(written.createdAt).toBeDefined();
    expect(written).toHaveProperty('verified');
  });

  it('writes .gitignore that excludes generated/', async () => {
    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init'], { from: 'user' });

    const gitignoreCall = mockedFs.writeFileSync.mock.calls.find(
      (call) => String(call[0]).includes('.gitignore')
    );
    expect(gitignoreCall).toBeDefined();
    expect(String(gitignoreCall![1])).toContain('generated/');
  });

  it('uses explicit --project-id when provided', async () => {
    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init', '--project-id', 'custom-id'], { from: 'user' });

    const projectJsonCall = mockedFs.writeFileSync.mock.calls.find(
      (call) => String(call[0]).includes('project.json')
    );
    const written = JSON.parse(projectJsonCall![1] as string);
    expect(written.projectId).toBe('custom-id');
  });

  it('uses explicit --api-url when provided', async () => {
    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init', '--api-url', 'https://omnus.dev'], { from: 'user' });

    const projectJsonCall = mockedFs.writeFileSync.mock.calls.find(
      (call) => String(call[0]).includes('project.json')
    );
    const written = JSON.parse(projectJsonCall![1] as string);
    expect(written.apiUrl).toBe('https://omnus.dev');
  });

  it('aborts early if .terso/ already exists', async () => {
    mockedFs.existsSync.mockReturnValue(true);

    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init'], { from: 'user' });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Terso is already initialized in this directory.'
    );
    // Should not write project.json (i.e., no writeFileSync calls for project.json)
    const projectJsonCall = mockedFs.writeFileSync.mock.calls.find(
      (call) => String(call[0]).includes('project.json')
    );
    expect(projectJsonCall).toBeUndefined();
  });

  it('prints success message with project info', async () => {
    const { registerInitCommand } = await importInit();
    const program = buildProgram(registerInitCommand);

    await program.parseAsync(['init', '--project-id', 'test-proj'], { from: 'user' });

    expect(consoleSpy).toHaveBeenCalledWith('Terso initialized successfully.');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Project ID: test-proj')
    );
  });
});
