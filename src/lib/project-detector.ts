import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

export interface DetectedProject {
  name: string | null;
  source: string;
}

/**
 * Detect project identity from the current directory.
 * Priority: package.json name > git remote > directory name.
 *
 * Package.json is checked first because in monorepos, the git remote
 * gives the parent repo name, not the package name. Package.json is
 * the more specific identifier within a workspace.
 *
 * Detection is only a HINT. The detected name must be verified against
 * Omnus during `terso init` before becoming the canonical project ID.
 */
export function detectProject(dir: string): DetectedProject {
  // Try package.json first (more specific in monorepos)
  const packageName = detectFromPackageJson(dir);
  if (packageName) {
    return { name: packageName, source: 'package.json' };
  }

  // Try git remote origin
  const gitName = detectFromGit(dir);
  if (gitName) {
    return { name: gitName, source: 'git-remote' };
  }

  // Fall back to directory name
  return { name: path.basename(dir), source: 'directory-name' };
}

/**
 * Extract project name from git remote origin URL.
 * Handles both HTTPS and SSH URLs.
 */
function detectFromGit(dir: string): string | null {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      cwd: dir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    if (!remoteUrl) return null;

    // SSH: git@github.com:user/repo.git
    const sshMatch = remoteUrl.match(/[:\/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (sshMatch) return sshMatch[2];

    // HTTPS: https://github.com/user/repo.git
    const httpsMatch = remoteUrl.match(/\/([^/]+?)(?:\.git)?$/);
    if (httpsMatch) return httpsMatch[1];

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract project name from package.json.
 * Strips npm scope prefix if present.
 */
function detectFromPackageJson(dir: string): string | null {
  const packagePath = path.join(dir, 'package.json');

  if (!fs.existsSync(packagePath)) return null;

  try {
    const content = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);
    const name = pkg.name as string | undefined;

    if (!name) return null;

    // Strip scope: @scope/name -> name
    return name.replace(/^@[^/]+\//, '');
  } catch {
    return null;
  }
}
