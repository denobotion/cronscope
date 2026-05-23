import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { parseCrontab } from './cronParser';
import { ParseResult, ParseError } from '../types/cronJob';

const SYSTEM_CRON_DIRS = ['/etc/cron.d', '/etc/cron.daily', '/etc/cron.hourly', '/etc/cron.weekly'];

export async function readUserCrontab(source = 'local'): Promise<ParseResult> {
  const errors: ParseError[] = [];

  try {
    const { execSync } = await import('child_process');
    const raw = execSync('crontab -l 2>/dev/null', { encoding: 'utf-8' });
    return { jobs: parseCrontab(raw, source), errors, source };
  } catch {
    return { jobs: [], errors, source };
  }
}

export async function readCrontabFile(filePath: string): Promise<ParseResult> {
  const source = filePath;
  const errors: ParseError[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { jobs: parseCrontab(content, source), errors, source };
  } catch (err) {
    errors.push({
      line: 0,
      content: filePath,
      reason: err instanceof Error ? err.message : 'Unknown error reading file',
    });
    return { jobs: [], errors, source };
  }
}

export async function readSystemCrontabs(): Promise<ParseResult[]> {
  const results: ParseResult[] = [];

  for (const dir of SYSTEM_CRON_DIRS) {
    try {
      const entries = await fs.readdir(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
          results.push(await readCrontabFile(fullPath));
        }
      }
    } catch {
      // Directory may not exist on all systems
    }
  }

  return results;
}
