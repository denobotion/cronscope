import chalk from 'chalk';
import { CronJob } from '../types/cronJob';
import { resolveJobStatus } from '../scheduler/jobStatusResolver';
import { getNextRunsForJob } from '../scheduler/nextRunCalculator';

export interface TableColumn {
  key: string;
  label: string;
  width: number;
}

const COLUMNS: TableColumn[] = [
  { key: 'status', label: 'STATUS', width: 10 },
  { key: 'schedule', label: 'SCHEDULE', width: 20 },
  { key: 'command', label: 'COMMAND', width: 40 },
  { key: 'nextRun', label: 'NEXT RUN', width: 22 },
  { key: 'host', label: 'HOST', width: 16 },
];

function pad(str: string, width: number): string {
  const truncated = str.length > width ? str.slice(0, width - 1) + '…' : str;
  return truncated.padEnd(width);
}

function colorizeStatus(status: string): string {
  switch (status) {
    case 'active': return chalk.green(pad(status, 10));
    case 'overdue': return chalk.red(pad(status, 10));
    case 'pending': return chalk.yellow(pad(status, 10));
    default: return chalk.gray(pad(status, 10));
  }
}

export function renderTableHeader(): string {
  const header = COLUMNS.map(col => chalk.bold.cyan(pad(col.label, col.width))).join(' ');
  const divider = COLUMNS.map(col => '─'.repeat(col.width)).join('─');
  return `${header}\n${divider}`;
}

export function renderJobRow(job: CronJob, now: Date = new Date()): string {
  const status = resolveJobStatus(job, now);
  const nextRuns = getNextRunsForJob(job, now, 1);
  const nextRun = nextRuns.length > 0 ? nextRuns[0].toISOString().replace('T', ' ').slice(0, 19) : 'N/A';

  const cols = [
    colorizeStatus(status),
    chalk.white(pad(job.schedule, 20)),
    chalk.white(pad(job.command, 40)),
    chalk.magenta(pad(nextRun, 22)),
    chalk.gray(pad(job.host ?? 'localhost', 16)),
  ];

  return cols.join(' ');
}

export function renderJobTable(jobs: CronJob[], now: Date = new Date()): string {
  if (jobs.length === 0) {
    return chalk.gray('No cron jobs found.');
  }
  const rows = jobs.map(job => renderJobRow(job, now));
  return [renderTableHeader(), ...rows].join('\n');
}
