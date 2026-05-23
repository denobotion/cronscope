import * as fs from 'fs';
import * as path from 'path';
import { CronJob } from '../types/cronJob';

export interface AuditEntry {
  timestamp: string;
  event: 'job_added' | 'job_removed' | 'job_changed' | 'health_warning' | 'poll_error';
  host: string;
  jobId: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AuditLog {
  entries: AuditEntry[];
}

export function createAuditEntry(
  event: AuditEntry['event'],
  host: string,
  jobId: string,
  message: string,
  details?: Record<string, unknown>
): AuditEntry {
  return {
    timestamp: new Date().toISOString(),
    event,
    host,
    jobId,
    message,
    details,
  };
}

export function appendAuditEntry(log: AuditLog, entry: AuditEntry): AuditLog {
  return { entries: [...log.entries, entry] };
}

export function filterAuditLog(
  log: AuditLog,
  predicate: (entry: AuditEntry) => boolean
): AuditEntry[] {
  return log.entries.filter(predicate);
}

export function writeAuditLog(log: AuditLog, filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(log, null, 2), 'utf-8');
}

export function readAuditLog(filePath: string): AuditLog {
  if (!fs.existsSync(filePath)) {
    return { entries: [] };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as AuditLog;
}
