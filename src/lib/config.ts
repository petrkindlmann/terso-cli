import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const GLOBAL_CONFIG_DIR = '.terso';
const GLOBAL_CONFIG_FILE = 'config.json';
const PROJECT_TERSO_DIR = '.terso';
const PROJECT_CONFIG_FILE = 'project.json';

export interface GlobalConfig {
  apiUrl?: string;
  apiKey?: string;
}

export interface ProjectConfig {
  projectId: string;
  apiUrl: string;
  apiKey?: string;
  detectedFrom?: string;
  createdAt?: string;
}

/**
 * Load global config from ~/.terso/config.json.
 * Returns an empty object if file does not exist.
 */
export function loadGlobalConfig(): GlobalConfig {
  const configPath = path.join(os.homedir(), GLOBAL_CONFIG_DIR, GLOBAL_CONFIG_FILE);

  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as GlobalConfig;
  } catch {
    return {};
  }
}

/**
 * Load project config from .terso/project.json in the current directory.
 * Merges with global config (project values override global).
 * Throws if .terso/project.json does not exist or is invalid.
 */
export function loadProjectConfig(): ProjectConfig {
  const projectConfigPath = path.join(process.cwd(), PROJECT_TERSO_DIR, PROJECT_CONFIG_FILE);

  if (!fs.existsSync(projectConfigPath)) {
    throw new Error(
      'No .terso/project.json found. Run `terso init` to initialize this project.'
    );
  }

  let projectConfig: Record<string, unknown>;
  try {
    const content = fs.readFileSync(projectConfigPath, 'utf-8');
    projectConfig = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to parse .terso/project.json: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }

  if (!projectConfig.projectId || typeof projectConfig.projectId !== 'string') {
    throw new Error('Missing or invalid projectId in .terso/project.json');
  }

  // Merge with global config (project overrides global)
  const globalConfig = loadGlobalConfig();

  return {
    projectId: projectConfig.projectId as string,
    apiUrl: (projectConfig.apiUrl as string) || globalConfig.apiUrl || 'https://omnus.dev',
    apiKey: process.env.TERSO_API_TOKEN || (projectConfig.apiKey as string) || globalConfig.apiKey,
    detectedFrom: projectConfig.detectedFrom as string | undefined,
    createdAt: projectConfig.createdAt as string | undefined,
  };
}

/**
 * Save global config to ~/.terso/config.json.
 */
export function saveGlobalConfig(config: GlobalConfig): void {
  const configDir = path.join(os.homedir(), GLOBAL_CONFIG_DIR);
  const configPath = path.join(configDir, GLOBAL_CONFIG_FILE);

  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
}
