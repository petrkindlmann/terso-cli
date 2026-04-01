import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

vi.mock('node:fs');

const mockedFs = vi.mocked(fs);

async function importOfflineStore() {
  return await import('../../src/lib/offline-store.js');
}

describe('offline-store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(process, 'cwd').mockReturnValue('/projects/my-app');
  });

  const capturesPath = path.join('/projects/my-app', '.terso', 'local', 'captures.jsonl');

  describe('appendOfflineCapture', () => {
    it('creates directory and appends capture as JSONL', async () => {
      mockedFs.mkdirSync.mockReturnValue(undefined);
      mockedFs.appendFileSync.mockReturnValue(undefined);

      const { appendOfflineCapture } = await importOfflineStore();

      appendOfflineCapture({
        text: 'Deploy to Cloudflare Workers',
        projectHint: 'my-app',
        scopeHint: 'project',
        capturedAt: '2026-03-15T10:00:00Z',
      });

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith(
        path.dirname(capturesPath),
        { recursive: true }
      );

      const appendedData = mockedFs.appendFileSync.mock.calls[0][1] as string;
      expect(appendedData).toMatch(/\n$/);
      const parsed = JSON.parse(appendedData.trim());
      expect(parsed.text).toBe('Deploy to Cloudflare Workers');
      expect(parsed.projectHint).toBe('my-app');
      expect(parsed.capturedAt).toBe('2026-03-15T10:00:00Z');
    });

    it('appends capture without optional fields', async () => {
      mockedFs.mkdirSync.mockReturnValue(undefined);
      mockedFs.appendFileSync.mockReturnValue(undefined);

      const { appendOfflineCapture } = await importOfflineStore();

      appendOfflineCapture({
        text: 'Quick note',
        capturedAt: '2026-03-15T10:00:00Z',
      });

      const appendedData = mockedFs.appendFileSync.mock.calls[0][1] as string;
      const parsed = JSON.parse(appendedData.trim());
      expect(parsed.text).toBe('Quick note');
      expect(parsed.projectHint).toBeUndefined();
      expect(parsed.scopeHint).toBeUndefined();
    });
  });

  describe('readOfflineCaptures', () => {
    it('returns empty array when captures file does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const { readOfflineCaptures } = await importOfflineStore();
      const result = readOfflineCaptures();

      expect(result).toEqual([]);
    });

    it('returns empty array when captures file is empty', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockReturnValue('  \n  ');

      const { readOfflineCaptures } = await importOfflineStore();
      const result = readOfflineCaptures();

      expect(result).toEqual([]);
    });

    it('parses JSONL file into array of captures', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      const lines = [
        JSON.stringify({ text: 'First capture', capturedAt: '2026-03-15T09:00:00Z' }),
        JSON.stringify({ text: 'Second capture', capturedAt: '2026-03-15T10:00:00Z' }),
      ].join('\n');
      mockedFs.readFileSync.mockReturnValue(lines);

      const { readOfflineCaptures } = await importOfflineStore();
      const result = readOfflineCaptures();

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('First capture');
      expect(result[1].text).toBe('Second capture');
    });

    it('reads from correct path', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const { readOfflineCaptures } = await importOfflineStore();
      readOfflineCaptures();

      expect(mockedFs.existsSync).toHaveBeenCalledWith(capturesPath);
    });
  });

  describe('clearOfflineCaptures', () => {
    it('deletes the captures file when it exists', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.unlinkSync.mockReturnValue(undefined);

      const { clearOfflineCaptures } = await importOfflineStore();
      clearOfflineCaptures();

      expect(mockedFs.unlinkSync).toHaveBeenCalledWith(capturesPath);
    });

    it('does nothing when captures file does not exist', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const { clearOfflineCaptures } = await importOfflineStore();
      clearOfflineCaptures();

      expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('pendingCaptureCount', () => {
    it('returns 0 when no captures file', async () => {
      mockedFs.existsSync.mockReturnValue(false);

      const { pendingCaptureCount } = await importOfflineStore();
      const count = pendingCaptureCount();

      expect(count).toBe(0);
    });

    it('returns count of captures in file', async () => {
      mockedFs.existsSync.mockReturnValue(true);
      const lines = [
        JSON.stringify({ text: 'one', capturedAt: '2026-03-15T09:00:00Z' }),
        JSON.stringify({ text: 'two', capturedAt: '2026-03-15T10:00:00Z' }),
        JSON.stringify({ text: 'three', capturedAt: '2026-03-15T11:00:00Z' }),
      ].join('\n');
      mockedFs.readFileSync.mockReturnValue(lines);

      const { pendingCaptureCount } = await importOfflineStore();
      const count = pendingCaptureCount();

      expect(count).toBe(3);
    });
  });
});
