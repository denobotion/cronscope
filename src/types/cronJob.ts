export interface CronJob {
  id: string;
  schedule: string;
  command: string;
  user?: string;
  host?: string;
  description?: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status?: JobStatus;
  tags?: string[];
}

export type JobStatus = 'ok' | 'warning' | 'error' | 'unknown' | 'stale';

export interface JobFilter {
  status?: JobStatus;
  host?: string;
  query?: string;
}

export type SortField = 'nextRun' | 'status' | 'host' | 'command';

export interface SortOptions {
  field: SortField;
  direction: 'asc' | 'desc';
}

export interface KeyBinding {
  key: string;
  description: string;
}

export interface RemoteHost {
  alias: string;
  hostname: string;
  user?: string;
  port?: number;
  identityFile?: string;
}
