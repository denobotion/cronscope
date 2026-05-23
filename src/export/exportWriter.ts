import fs from 'fs';
import path from 'path';
import { CronJob } from '../types/cronJob';
import { ExportFormat, formatExport } from './exportFormatter';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  append?: boolean;
}

export function writeExport(
  jobs: CronJob[],
  options: ExportOptions
): { output: string; writtenTo: string | null } {
  const output = formatExport(jobs, options.format);

  if (!options.outputPath) {
    return { output, writtenTo: null };
  }

  const resolvedPath = path.resolve(options.outputPath);
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const flag = options.append ? 'a' : 'w';
  const content = options.append ? '\n' + output : output;
  fs.writeFileSync(resolvedPath, content, { flag });

  return { output, writtenTo: resolvedPath };
}

export function getDefaultFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = format === 'markdown' ? 'md' : format;
  return `cronscope-export-${timestamp}.${ext}`;
}
