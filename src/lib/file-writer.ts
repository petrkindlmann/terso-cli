import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';

const TERSO_DIR = '.terso';
const GENERATED_DIR = 'generated';

export interface ContextFile {
  /** Path relative to the generated directory (e.g., "CLAUDE.md", never ".terso/generated/CLAUDE.md") */
  path: string;
  /** Final file content as received from the server. Written as-is, no client-side mutation. */
  content: string;
}

/**
 * Write context files to .terso/generated/.
 * Server owns the final file content (including frontmatter).
 * CLI writes exact bytes received — no client-side frontmatter generation.
 *
 * Uses atomic writes (temp file + rename) to prevent partial writes.
 * Only writes files whose content has actually changed (content-addressed).
 *
 * Returns the number of files written (changed).
 */
export function writeContextFiles(files: ContextFile[]): number {
  const generatedDir = path.join(process.cwd(), TERSO_DIR, GENERATED_DIR);

  // Validate paths: reject absolute, parent traversal, or .terso/ prefix
  for (const file of files) {
    if (path.isAbsolute(file.path)) {
      throw new Error(`Invalid context file path (absolute): ${file.path}`);
    }
    if (file.path.includes('..')) {
      throw new Error(`Invalid context file path (parent traversal): ${file.path}`);
    }
    if (file.path.startsWith('.terso/') || file.path.startsWith('.terso\\')) {
      throw new Error(`Invalid context file path (nested .terso): ${file.path}`);
    }
  }

  fs.mkdirSync(generatedDir, { recursive: true });

  let written = 0;

  for (const file of files) {
    const filePath = path.join(generatedDir, file.path);
    const fileDir = path.dirname(filePath);
    fs.mkdirSync(fileDir, { recursive: true });

    // Skip write if content hasn't changed (content-addressed)
    if (fs.existsSync(filePath)) {
      const existing = fs.readFileSync(filePath, 'utf-8');
      if (existing === file.content) continue;
    }

    // Atomic write: temp file + rename
    const tmpPath = path.join(os.tmpdir(), `terso-${createHash('sha256').update(filePath).digest('hex').slice(0, 12)}.tmp`);
    fs.writeFileSync(tmpPath, file.content, 'utf-8');
    fs.renameSync(tmpPath, filePath);
    written++;
  }

  return written;
}

/**
 * Remove all files from .terso/generated/ that are not in the provided set.
 * Useful for cleaning up stale context after a sync.
 */
export function cleanStaleFiles(currentFiles: Set<string>): number {
  const generatedDir = path.join(process.cwd(), TERSO_DIR, GENERATED_DIR);

  if (!fs.existsSync(generatedDir)) return 0;

  let removed = 0;
  const entries = fs.readdirSync(generatedDir, { recursive: true, withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    const relativePath = path.relative(
      generatedDir,
      path.join(entry.parentPath, entry.name)
    );

    if (!currentFiles.has(relativePath)) {
      fs.unlinkSync(path.join(generatedDir, relativePath));
      removed++;
    }
  }

  return removed;
}
