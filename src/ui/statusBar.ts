import { CronJob } from '../types/cronJob';
import { JobHealthWarning } from '../scheduler/cronHealthChecker';

export interface StatusBarState {
  totalJobs: number;
  activeJobs: number;
  warningCount: number;
  errorCount: number;
  lastRefreshed: Date;
  host: string;
}

export function buildStatusBarState(
  jobs: CronJob[],
  warnings: JobHealthWarning[],
  host: string = 'localhost'
): StatusBarState {
  const activeJobs = jobs.filter(j => j.enabled !== false).length;
  const errorCount = warnings.filter(w => w.severity === 'error').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;

  return {
    totalJobs: jobs.length,
    activeJobs,
    warningCount,
    errorCount,
    lastRefreshed: new Date(),
    host,
  };
}

export function formatRefreshedTime(date: Date): string {
  return date.toTimeString().slice(0, 8);
}

export function renderStatusBar(state: StatusBarState, width: number = 80): string {
  const hostPart = `Host: ${state.host}`;
  const jobsPart = `Jobs: ${state.activeJobs}/${state.totalJobs}`;

  const warnColor = state.warningCount > 0 ? '\x1b[33m' : '\x1b[32m';
  const errColor = state.errorCount > 0 ? '\x1b[31m' : '\x1b[32m';
  const reset = '\x1b[0m';

  const warnPart = `${warnColor}Warnings: ${state.warningCount}${reset}`;
  const errPart = `${errColor}Errors: ${state.errorCount}${reset}`;
  const timePart = `Refreshed: ${formatRefreshedTime(state.lastRefreshed)}`;

  const visibleContent = `${hostPart}  ${jobsPart}  Warnings: ${state.warningCount}  Errors: ${state.errorCount}  ${timePart}`;
  const padding = Math.max(0, width - visibleContent.length);
  const paddingStr = ' '.repeat(padding);

  return `\x1b[7m ${hostPart}  ${jobsPart}  ${warnPart}  ${errPart}  ${timePart}${paddingStr} ${reset}`;
}
