import { CronJob } from '../types/cronJob';
import { filterJobs, sortJobs } from '../scheduler/jobFilter';
import { searchJobs } from '../scheduler/searchFilter';
import { writeExport, getDefaultFilename, ExportOptions } from './exportWriter';
import { ExportFormat } from './exportFormatter';

export interface ExportCommandOptions {
  format: ExportFormat;
  outputPath?: string;
  query?: string;
  host?: string;
  status?: string;
  sortBy?: 'nextRun' | 'status' | 'host';
  stdout?: boolean;
}

export function runExportCommand(
  jobs: CronJob[],
  options: ExportCommandOptions
): { writtenTo: string | null; count: number; output: string } {
  let filtered = jobs;

  if (options.query) {
    filtered = searchJobs(filtered, options.query);
  }

  filtered = filterJobs(filtered, {
    host: options.host,
    status: options.status as CronJob['status'],
  });

  if (options.sortBy) {
    filtered = sortJobs(filtered, options.sortBy);
  }

  const outputPath =
    options.stdout ? undefined : (options.outputPath ?? getDefaultFilename(options.format));

  const exportOptions: ExportOptions = {
    format: options.format,
    outputPath,
  };

  const { output, writtenTo } = writeExport(filtered, exportOptions);

  return { writtenTo, count: filtered.length, output };
}
