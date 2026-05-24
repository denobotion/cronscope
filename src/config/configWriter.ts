import * as fs from 'fs';
import * as path from 'path';
import { CronScopeConfig, validateConfig } from './cronScopeConfig';

export function writeConfig(
  config: CronScopeConfig,
  filePath: string
): { success: boolean; errors: string[] } {
  const errors = validateConfig(config);
  if (errors.length > 0) {
    return { success: false, errors };
  }
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  return { success: true, errors: [] };
}

export function writeDefaultConfig(
  targetDir: string = process.cwd()
): { filePath: string; success: boolean; errors: string[] } {
  const filePath = path.join(targetDir, '.cronscope.json');
  if (fs.existsSync(filePath)) {
    return {
      filePath,
      success: false,
      errors: [`Config file already exists: ${filePath}`],
    };
  }
  const { CronScopeConfig: _, DEFAULT_CONFIG } = require('./cronScopeConfig');
  const result = writeConfig(DEFAULT_CONFIG, filePath);
  return { filePath, ...result };
}

export function renderConfigSummary(config: CronScopeConfig): string {
  const lines = [
    `  Refresh interval : ${config.refreshIntervalSeconds}s`,
    `  Max next runs    : ${config.maxNextRuns}`,
    `  Export format    : ${config.defaultExportFormat}`,
    `  Audit log path   : ${config.auditLogPath}`,
    `  Health checks    : ${config.healthCheckEnabled ? 'enabled' : 'disabled'}`,
    `  Stale threshold  : ${config.staleThresholdMinutes}min`,
    `  Theme            : ${config.theme}`,
    `  Remote hosts     : ${config.remoteHosts.length}`,
  ];
  return lines.join('\n');
}
