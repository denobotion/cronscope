import { CronJob } from '../types/cronJob';
import { getNextRuns } from './nextRunCalculator';

export type JobStatus = 'active' | 'overdue' | 'upcoming' | 'unknown';

export interface JobStatusInfo {
  status: JobStatus;
  nextRun: Date | null;
  previousRun: Date | null;
  minutesUntilNext: number | null;
}

/**
 * Resolves the current status of a cron job based on its schedule
 * and optional last-run timestamp.
 */
export function resolveJobStatus(
  job: CronJob,
  lastRunAt?: Date,
  now: Date = new Date()
): JobStatusInfo {
  let nextRun: Date | null = null;
  let previousRun: Date | null = lastRunAt ?? null;

  try {
    const upcoming = getNextRuns(job.schedule, 1, now);
    nextRun = upcoming[0] ?? null;
  } catch {
    return { status: 'unknown', nextRun: null, previousRun, minutesUntilNext: null };
  }

  const minutesUntilNext = nextRun
    ? Math.round((nextRun.getTime() - now.getTime()) / 60000)
    : null;

  let status: JobStatus = 'upcoming';

  if (lastRunAt) {
    const expectedInterval = estimateIntervalMinutes(job.schedule);
    const minutesSinceLast = (now.getTime() - lastRunAt.getTime()) / 60000;
    if (expectedInterval !== null && minutesSinceLast > expectedInterval * 1.5) {
      status = 'overdue';
    } else {
      status = 'active';
    }
  }

  return { status, nextRun, previousRun, minutesUntilNext };
}

function estimateIntervalMinutes(cronExpression: string): number | null {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [minuteExpr, hourExpr] = parts;

  if (minuteExpr.startsWith('*/')) return parseInt(minuteExpr.slice(2), 10);
  if (hourExpr.startsWith('*/')) return parseInt(hourExpr.slice(2), 10) * 60;
  if (minuteExpr === '*') return 1;
  return 60;
}
