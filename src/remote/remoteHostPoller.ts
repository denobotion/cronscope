import { RemoteHostConfig } from './remoteHostConfig';
import { flattenFetchResults } from './remoteCrontabFetcher';
import { CronJob } from '../types/cronJob';
import { parseCrontab } from '../parser/cronParser';
import { execSync } from 'child_process';
import { buildSshArgs } from './remoteHostConfig';

export interface PollResult {
  host: string;
  jobs: CronJob[];
  error?: string;
  polledAt: Date;
}

export interface PollerState {
  results: Map<string, PollResult>;
  intervalMs: number;
  timer: ReturnType<typeof setInterval> | null;
}

export function createPollerState(intervalMs = 60000): PollerState {
  return {
    results: new Map(),
    intervalMs,
    timer: null,
  };
}

export function pollHost(host: RemoteHostConfig): PollResult {
  const polledAt = new Date();
  try {
    const sshArgs = buildSshArgs(host);
    const cmd = `ssh ${sshArgs.join(' ')} 'crontab -l 2>/dev/null || true'`;
    const output = execSync(cmd, { timeout: 10000 }).toString();
    const jobs = parseCrontab(output, host.alias ?? host.host);
    return { host: host.alias ?? host.host, jobs, polledAt };
  } catch (err: any) {
    return {
      host: host.alias ?? host.host,
      jobs: [],
      error: err?.message ?? 'Unknown error',
      polledAt,
    };
  }
}

export function pollAllHosts(hosts: RemoteHostConfig[]): PollResult[] {
  return hosts.map(pollHost);
}

export function startPoller(
  state: PollerState,
  hosts: RemoteHostConfig[],
  onUpdate: (results: PollResult[]) => void
): PollerState {
  if (state.timer) clearInterval(state.timer);
  const tick = () => {
    const results = pollAllHosts(hosts);
    results.forEach((r) => state.results.set(r.host, r));
    onUpdate(results);
  };
  tick();
  const timer = setInterval(tick, state.intervalMs);
  return { ...state, timer };
}

export function stopPoller(state: PollerState): PollerState {
  if (state.timer) clearInterval(state.timer);
  return { ...state, timer: null };
}

export function getAllJobsFromState(state: PollerState): CronJob[] {
  return flattenFetchResults(
    Array.from(state.results.values()).map((r) => ({
      host: r.host,
      jobs: r.jobs,
      error: r.error,
    }))
  );
}
