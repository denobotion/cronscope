import { CronJob } from '../types/cronJob';

export type ExportFormat = 'json' | 'csv' | 'markdown';

export function exportToJson(jobs: CronJob[]): string {
  return JSON.stringify(
    jobs.map((job) => ({
      id: job.id,
      schedule: job.schedule,
      command: job.command,
      host: job.host,
      user: job.user,
      status: job.status,
      nextRun: job.nextRun,
      lastRun: job.lastRun,
    })),
    null,
    2
  );
}

export function exportToCsv(jobs: CronJob[]): string {
  const header = 'id,schedule,command,host,user,status,nextRun,lastRun';
  const rows = jobs.map((job) => {
    const fields = [
      job.id,
      `"${job.schedule}"`,
      `"${job.command.replace(/"/g, '""')}"`,
      job.host ?? '',
      job.user ?? '',
      job.status ?? '',
      job.nextRun ? job.nextRun.toISOString() : '',
      job.lastRun ? job.lastRun.toISOString() : '',
    ];
    return fields.join(',');
  });
  return [header, ...rows].join('\n');
}

export function exportToMarkdown(jobs: CronJob[]): string {
  const header = '| ID | Schedule | Command | Host | User | Status | Next Run |';
  const divider = '|---|---|---|---|---|---|---|';
  const rows = jobs.map((job) => {
    const nextRun = job.nextRun ? job.nextRun.toISOString() : 'N/A';
    return `| ${job.id} | \`${job.schedule}\` | \`${job.command}\` | ${job.host ?? '-'} | ${job.user ?? '-'} | ${job.status ?? '-'} | ${nextRun} |`;
  });
  return [header, divider, ...rows].join('\n');
}

export function formatExport(jobs: CronJob[], format: ExportFormat): string {
  switch (format) {
    case 'json': return exportToJson(jobs);
    case 'csv': return exportToCsv(jobs);
    case 'markdown': return exportToMarkdown(jobs);
    default: throw new Error(`Unsupported export format: ${format}`);
  }
}
