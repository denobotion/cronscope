import { CronJob, JobStatus } from '../types/cronJob';

export interface FilterOptions {
  status?: JobStatus | JobStatus[];
  user?: string | string[];
  host?: string | string[];
  search?: string;
  enabledOnly?: boolean;
}

export function filterJobs(jobs: CronJob[], options: FilterOptions): CronJob[] {
  let result = [...jobs];

  if (options.status !== undefined) {
    const statuses = Array.isArray(options.status) ? options.status : [options.status];
    result = result.filter((job) => statuses.includes(job.status));
  }

  if (options.user !== undefined) {
    const users = Array.isArray(options.user) ? options.user : [options.user];
    result = result.filter((job) => job.user !== undefined && users.includes(job.user));
  }

  if (options.host !== undefined) {
    const hosts = Array.isArray(options.host) ? options.host : [options.host];
    result = result.filter((job) => job.host !== undefined && hosts.includes(job.host));
  }

  if (options.enabledOnly) {
    result = result.filter((job) => !job.disabled);
  }

  if (options.search) {
    const term = options.search.toLowerCase();
    result = result.filter(
      (job) =>
        job.command.toLowerCase().includes(term) ||
        job.schedule.toLowerCase().includes(term) ||
        (job.comment && job.comment.toLowerCase().includes(term)) ||
        (job.user && job.user.toLowerCase().includes(term))
    );
  }

  return result;
}

export function sortJobs(
  jobs: CronJob[],
  by: 'nextRun' | 'status' | 'user' | 'command' = 'nextRun',
  direction: 'asc' | 'desc' = 'asc'
): CronJob[] {
  const sorted = [...jobs].sort((a, b) => {
    let cmp = 0;
    if (by === 'nextRun') {
      const aTime = a.nextRun ? a.nextRun.getTime() : Infinity;
      const bTime = b.nextRun ? b.nextRun.getTime() : Infinity;
      cmp = aTime - bTime;
    } else if (by === 'status') {
      cmp = (a.status ?? '').localeCompare(b.status ?? '');
    } else if (by === 'user') {
      cmp = (a.user ?? '').localeCompare(b.user ?? '');
    } else if (by === 'command') {
      cmp = a.command.localeCompare(b.command);
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}
