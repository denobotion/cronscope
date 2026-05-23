import chalk from 'chalk';
import { CronJob } from '../types/cronJob';
import { renderJobTable } from './jobTable';
import { filterJobs, sortJobs, FilterOptions } from '../scheduler/jobFilter';
import { resolveJobStatus } from '../scheduler/jobStatusResolver';

export interface DashboardOptions {
  filter?: FilterOptions;
  title?: string;
}

function renderSummaryBar(jobs: CronJob[], now: Date): string {
  const counts = { active: 0, pending: 0, overdue: 0, unknown: 0 };
  for (const job of jobs) {
    const status = resolveJobStatus(job, now) as keyof typeof counts;
    if (status in counts) counts[status]++;
  }
  const parts = [
    chalk.green(`✔ active: ${counts.active}`),
    chalk.yellow(`⏳ pending: ${counts.pending}`),
    chalk.red(`✖ overdue: ${counts.overdue}`),
    chalk.gray(`? unknown: ${counts.unknown}`),
  ];
  return parts.join('   ');
}

function renderTitle(title: string): string {
  const line = '═'.repeat(title.length + 4);
  return [
    chalk.bold.blue(`╔${line}╗`),
    chalk.bold.blue(`║  ${title}  ║`),
    chalk.bold.blue(`╚${line}╝`),
  ].join('\n');
}

export function renderDashboard(
  jobs: CronJob[],
  options: DashboardOptions = {},
  now: Date = new Date()
): string {
  const title = options.title ?? 'CronScope Dashboard';
  const filtered = options.filter ? filterJobs(jobs, options.filter) : jobs;
  const sorted = sortJobs(filtered, 'nextRun');

  const sections = [
    renderTitle(title),
    '',
    chalk.dim(`Generated at: ${now.toISOString()}   Total jobs: ${jobs.length}`),
    '',
    renderSummaryBar(sorted, now),
    '',
    renderJobTable(sorted, now),
  ];

  return sections.join('\n');
}
