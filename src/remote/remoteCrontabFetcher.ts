import { execFile } from 'child_process';
import { promisify } from 'util';
import { RemoteHost, buildSshArgs } from './remoteHostConfig';
import { parseCrontab } from '../parser/cronParser';
import { CronJob } from '../types/cronJob';

const execFileAsync = promisify(execFile);

const CRONTAB_COMMAND = 'crontab -l 2>/dev/null || true';
const SSH_TIMEOUT_MS = 10_000;

export interface FetchResult {
  host: RemoteHost;
  jobs: CronJob[];
  error?: string;
}

export async function fetchRemoteCrontab(host: RemoteHost): Promise<FetchResult> {
  const sshArgs = buildSshArgs(host);
  sshArgs.push(
    '-o', 'BatchMode=yes',
    '-o', `ConnectTimeout=${Math.floor(SSH_TIMEOUT_MS / 1000)}`,
    CRONTAB_COMMAND
  );

  try {
    const { stdout } = await execFileAsync('ssh', sshArgs, {
      timeout: SSH_TIMEOUT_MS,
    });
    const jobs = parseCrontab(stdout, host.id);
    return { host, jobs };
  } catch (err: any) {
    return {
      host,
      jobs: [],
      error: err?.message ?? 'Unknown SSH error',
    };
  }
}

export async function fetchAllRemoteCrontabs(hosts: RemoteHost[]): Promise<FetchResult[]> {
  return Promise.all(hosts.map(fetchRemoteCrontab));
}

export function flattenFetchResults(results: FetchResult[]): CronJob[] {
  return results.flatMap((r) => r.jobs);
}
