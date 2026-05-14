import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

function readVersion(): string {
  // dist/lib/version.js → ../../package.json when published.
  // src/lib/version.ts → ../../package.json when running via tsx.
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, '..', '..', 'package.json'),
    join(here, '..', '..', '..', 'package.json'),
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, 'utf-8')) as { name?: string; version?: string };
      if (parsed.name === 'terso-cli' && typeof parsed.version === 'string') {
        return parsed.version;
      }
    } catch {
      // try next candidate
    }
  }
  return '0.0.0-unknown';
}

export const VERSION = readVersion();
