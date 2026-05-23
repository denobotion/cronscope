import { CronJob } from '../types/cronJob';
import { resolveJobStatus, estimateIntervalMinutes } from './jobStatusResolver';

export interface HealthReport {
  job: CronJob;
  status: string;
  intervalMinutes: number;
  isOverdue: boolean;
  overdueByMinutes: number;
  warning: string | null;
}

const OVERDUE_THRESHOLD_MULTIPLIER = 1.5;
const HIGH_FREQUENCY_THRESHOLD = 5;
const LONG_RUNNING_THRESHOLD = 1440; // 24 hours in minutes

export function checkJobHealth(job: CronJob, now: Date = new Date()): HealthReport {
  const status = resolveJobStatus(job, now);
  const intervalMinutes = estimateIntervalMinutes(job.schedule);

  let overdueByMinutes = 0;
  let isOverdue = false;

  if (job.lastRun) {
    const minutesSinceLastRun = (now.getTime() - job.lastRun.getTime()) / 60000;
    const overdueThreshold = intervalMinutes * OVERDUE_THRESHOLD_MULTIPLIER;
    if (minutesSinceLastRun > overdueThreshold) {
      isOverdue = true;
      overdueByMinutes = Math.round(minutesSinceLastRun - intervalMinutes);
    }
  }

  const warning = buildWarning(job, intervalMinutes, isOverdue, overdueByMinutes);

  return { job, status, intervalMinutes, isOverdue, overdueByMinutes, warning };
}

function buildWarning(
  job: CronJob,
  intervalMinutes: number,
  isOverdue: boolean,
  overdueByMinutes: number
): string | null {
  if (isOverdue) {
    return `Job "${job.name}" is overdue by ~${overdueByMinutes} minute(s).`;
  }
  if (intervalMinutes > 0 && intervalMinutes < HIGH_FREQUENCY_THRESHOLD) {
    return `Job "${job.name}" runs very frequently (~${intervalMinutes} min interval).`;
  }
  if (intervalMinutes >= LONG_RUNNING_THRESHOLD) {
    return `Job "${job.name}" has a long interval (~${Math.round(intervalMinutes / 60)}h). Verify it is intentional.`;
  }
  return null;
}

export function checkAllJobsHealth(jobs: CronJob[], now: Date = new Date()): HealthReport[] {
  return jobs.map((job) => checkJobHealth(job, now));
}

export function getUnhealthyJobs(reports: HealthReport[]): HealthReport[] {
  return reports.filter((r) => r.isOverdue || r.warning !== null);
}
