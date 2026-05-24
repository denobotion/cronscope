import * as fs from 'fs';
import * as path from 'path';
import {
  CronScopeConfig,
  DEFAULT_CONFIG,
  mergeConfig,
  validateConfig,
} from './cronScopeConfig';

const CONFIG_FILENAMES = [
  '.cronscope.json',
  'cronscope.config.json',
];

export function findConfigFile(startDir: string = process.cwd()): string | null {
  for (const name of CONFIG_FILENAMES) {
    const candidate = path.join(startDir, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (home) {
    for (const name of CONFIG_FILENAMES) {
      const candidate = path.join(home, name);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

export function loadConfigFromFile(filePath: string): Partial<CronScopeConfig> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as Partial<CronScopeConfig>;
}

export function loadConfig(overrides?: Partial<CronScopeConfig>): {
  config: CronScopeConfig;
  errors: string[];
  source: string;
} {
  let partial: Partial<CronScopeConfig> = {};
  let source = 'defaults';

  const configFile = findConfigFile();
  if (configFile) {
    partial = loadConfigFromFile(configFile);
    source = configFile;
  }

  if (overrides) {
    partial = { ...partial, ...overrides };
  }

  const config = mergeConfig(DEFAULT_CONFIG, partial);
  const errors = validateConfig(config);
  return { config, errors, source };
}
