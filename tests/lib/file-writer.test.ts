import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

vi.mock('node:fs');
vi.mock('node:os', () => ({
  tmpdir: () => '/tmp',
}));
vi.mock('node:crypto', () => ({
  createHash: () => ({
    update: () => ({
      digest: () => 'abcdef123456xxxxxxxxxxxxxxxxxxxxxx',
    }),
  }),
}));

const mockedFs = vi.mocked(fs);

async function importFileWriter() {
  return await import('../../src/lib/file-writer.js');
}

describe('writeContextFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);
    mockedFs.renameSync.mockReturnValue(undefined);
    mockedFs.existsSync.mockReturnValue(false);
  });

  it('creates the generated directory if it does not exist', async () => {
    const { writeContextFiles } = await importFileWriter();

    writeContextFiles([
      {
        path: 'ARCHITECTURE.md',
        content: '# Architecture',
      },
    ]);

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
      path.join('/projects/my-app', '.terso', 'generated'),
      { recursive: true }
    );
  });

  it('writes file content as-is (no client-side frontmatter)', async () => {
    const { writeContextFiles } = await importFileWriter();

    writeContextFiles([
      {
        path: 'ARCHITECTURE.md',
        content: '# Architecture\n\nOverview here.',
      },
    ]);

    // Atomic write: content goes to temp file, then rename
    const writtenContent = mockedFs.writeFileSync.mock.calls[0][1] as string;
    expect(writtenContent).toBe('# Architecture\n\nOverview here.');
    expect(mockedFs.renameSync).toHaveBeenCalled();
  });

  it('skips write when content is unchanged (content-addressed)', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('# Architecture');

    const { writeContextFiles } = await importFileWriter();

    const count = writeContextFiles([
      {
        path: 'ARCHITECTURE.md',
        content: '# Architecture',
      },
    ]);

    expect(count).toBe(0);
    expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    expect(mockedFs.renameSync).not.toHaveBeenCalled();
  });

  it('writes when content has changed', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('# Old Architecture');

    const { writeContextFiles } = await importFileWriter();

    const count = writeContextFiles([
      {
        path: 'ARCHITECTURE.md',
        content: '# New Architecture',
      },
    ]);

    expect(count).toBe(1);
    expect(mockedFs.writeFileSync).toHaveBeenCalled();
    expect(mockedFs.renameSync).toHaveBeenCalled();
  });

  it('returns count of written files', async () => {
    const { writeContextFiles } = await importFileWriter();

    const count = writeContextFiles([
      { path: 'A.md', content: 'a' },
      { path: 'B.md', content: 'b' },
      { path: 'C.md', content: 'c' },
    ]);

    expect(count).toBe(3);
  });

  it('returns 0 for empty file list', async () => {
    const { writeContextFiles } = await importFileWriter();

    const count = writeContextFiles([]);

    expect(count).toBe(0);
  });

  it('creates subdirectories for nested file paths', async () => {
    const { writeContextFiles } = await importFileWriter();

    writeContextFiles([
      {
        path: 'shared/deploy-recipes.md',
        content: '# Deploy',
      },
    ]);

    // Should create the subdirectory for the nested path
    const mkdirCalls = mockedFs.mkdirSync.mock.calls.map((c) => c[0]);
    const nestedDirCreated = mkdirCalls.some((dirPath) =>
      String(dirPath).includes(path.join('generated', 'shared'))
    );
    expect(nestedDirCreated).toBe(true);
  });

  it('writes files with utf-8 encoding', async () => {
    const { writeContextFiles } = await importFileWriter();

    writeContextFiles([
      {
        path: 'test.md',
        content: 'content',
      },
    ]);

    // Atomic write goes to temp file with utf-8
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'utf-8'
    );
  });

  it('uses atomic writes via temp file + rename', async () => {
    const { writeContextFiles } = await importFileWriter();

    writeContextFiles([
      {
        path: 'test.md',
        content: 'content',
      },
    ]);

    // Should write to a temp file first. Use the platform-appropriate
    // separator so the assertion holds on Windows ("\tmp\") too.
    const tempPath = mockedFs.writeFileSync.mock.calls[0][0] as string;
    const tmpSegment = `${path.sep}tmp${path.sep}`;
    expect(String(tempPath)).toContain(tmpSegment);

    // Then rename to the final path
    expect(mockedFs.renameSync).toHaveBeenCalledWith(
      expect.stringContaining(tmpSegment),
      path.join('/projects/my-app', '.terso', 'generated', 'test.md')
    );
  });

  it('rejects absolute paths', async () => {
    const { writeContextFiles } = await importFileWriter();

    expect(() =>
      writeContextFiles([{ path: '/etc/passwd', content: 'evil' }])
    ).toThrow('absolute');
  });

  it('rejects parent traversal paths', async () => {
    const { writeContextFiles } = await importFileWriter();

    expect(() =>
      writeContextFiles([{ path: '../../../etc/passwd', content: 'evil' }])
    ).toThrow('parent traversal');
  });
});

describe('cleanStaleFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
  });

  it('returns 0 when generated directory does not exist', async () => {
    mockedFs.existsSync.mockReturnValue(false);

    const { cleanStaleFiles } = await importFileWriter();
    const removed = cleanStaleFiles(new Set(['A.md']));

    expect(removed).toBe(0);
  });

  it('removes files not in the current set', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      {
        name: 'keep.md',
        isFile: () => true,
        isDirectory: () => false,
        parentPath: path.join('/projects/my-app', '.terso', 'generated'),
        path: path.join('/projects/my-app', '.terso', 'generated'),
      },
      {
        name: 'stale.md',
        isFile: () => true,
        isDirectory: () => false,
        parentPath: path.join('/projects/my-app', '.terso', 'generated'),
        path: path.join('/projects/my-app', '.terso', 'generated'),
      },
    ] as any);
    mockedFs.unlinkSync.mockReturnValue(undefined);

    const { cleanStaleFiles } = await importFileWriter();
    const removed = cleanStaleFiles(new Set(['keep.md']));

    expect(removed).toBe(1);
    expect(mockedFs.unlinkSync).toHaveBeenCalledWith(
      path.join('/projects/my-app', '.terso', 'generated', 'stale.md')
    );
  });

  it('does not remove files that are in the current set', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readdirSync.mockReturnValue([
      {
        name: 'keep.md',
        isFile: () => true,
        isDirectory: () => false,
        parentPath: path.join('/projects/my-app', '.terso', 'generated'),
        path: path.join('/projects/my-app', '.terso', 'generated'),
      },
    ] as any);
    mockedFs.unlinkSync.mockReturnValue(undefined);

    const { cleanStaleFiles } = await importFileWriter();
    const removed = cleanStaleFiles(new Set(['keep.md']));

    expect(removed).toBe(0);
    expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
  });
});
