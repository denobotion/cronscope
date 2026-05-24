export interface CronScopeConfig {
  refreshIntervalSeconds: number;
  maxNextRuns: number;
  defaultExportFormat: 'json' | 'csv' | 'markdown';
  auditLogPath: string;
  remoteHosts: RemoteHostEntry[];
  healthCheckEnabled: boolean;
  staleThresholdMinutes: number;
  theme: 'dark' | 'light';
}

export interface RemoteHostEntry {
  alias: string;
  host: string;
  user?: string;
  port?: number;
  identityFile?: string;
}

export const DEFAULT_CONFIG: CronScopeConfig = {
  refreshIntervalSeconds: 30,
  maxNextRuns: 5,
  defaultExportFormat: 'json',
  auditLogPath: './cronscope-audit.log',
  remoteHosts: [],
  healthCheckEnabled: true,
  staleThresholdMinutes: 60,
  theme: 'dark',
};

export function mergeConfig(
  base: CronScopeConfig,
  overrides: Partial<CronScopeConfig>
): CronScopeConfig {
  return { ...base, ...overrides };
}

export function validateConfig(config: CronScopeConfig): string[] {
  const errors: string[] = [];
  if (config.refreshIntervalSeconds < 5) {
    errors.push('refreshIntervalSeconds must be at least 5');
  }
  if (config.maxNextRuns < 1 || config.maxNextRuns > 20) {
    errors.push('maxNextRuns must be between 1 and 20');
  }
  if (config.staleThresholdMinutes < 1) {
    errors.push('staleThresholdMinutes must be at least 1');
  }
  for (const host of config.remoteHosts) {
    if (!host.alias || !host.host) {
      errors.push(`Remote host entry missing alias or host: ${JSON.stringify(host)}`);
    }
  }
  return errors;
}
