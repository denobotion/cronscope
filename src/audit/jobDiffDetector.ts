import { CronJob } from '../types/cronJob';
import { AuditEntry, createAuditEntry } from './auditLogger';

export interface JobSnapshot {
  host: string;
  jobs: CronJob[];
}

export interface JobDiff {
  added: CronJob[];
  removed: CronJob[];
  changed: Array<{ previous: CronJob; current: CronJob }>;
}

function jobKey(job: CronJob): string {
  return `${job.host}::${job.command}`;
}

export function diffJobSnapshots(previous: JobSnapshot, current: JobSnapshot): JobDiff {
  const prevMap = new Map(previous.jobs.map((j) => [jobKey(j), j]));
  const currMap = new Map(current.jobs.map((j) => [jobKey(j), j]));

  const added: CronJob[] = [];
  const removed: CronJob[] = [];
  const changed: Array<{ previous: CronJob; current: CronJob }> = [];

  for (const [key, curr] of currMap) {
    if (!prevMap.has(key)) {
      added.push(curr);
    } else {
      const prev = prevMap.get(key)!;
      if (prev.schedule !== curr.schedule) {
        changed.push({ previous: prev, current: curr });
      }
    }
  }

  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) {
      removed.push(prev);
    }
  }

  return { added, removed, changed };
}

export function diffToAuditEntries(diff: JobDiff, host: string): AuditEntry[] {
  const entries: AuditEntry[] = [];

  for (const job of diff.added) {
    entries.push(createAuditEntry('job_added', host, job.command, `Job added: ${job.command}`, { schedule: job.schedule }));
  }

  for (const job of diff.removed) {
    entries.push(createAuditEntry('job_removed', host, job.command, `Job removed: ${job.command}`, { schedule: job.schedule }));
  }

  for (const { previous, current } of diff.changed) {
    entries.push(
      createAuditEntry('job_changed', host, current.command, `Job schedule changed: ${current.command}`, {
        previousSchedule: previous.schedule,
        currentSchedule: current.schedule,
      })
    );
  }

  return entries;
}
