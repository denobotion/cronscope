import { PollResult } from './remoteHostPoller';

export interface HostPollStatus {
  host: string;
  ok: boolean;
  jobCount: number;
  error?: string;
  polledAt: Date;
  ageSeconds: number;
}

export function buildPollStatus(
  result: PollResult,
  now: Date = new Date()
): HostPollStatus {
  const ageSeconds = Math.floor(
    (now.getTime() - result.polledAt.getTime()) / 1000
  );
  return {
    host: result.host,
    ok: !result.error,
    jobCount: result.jobs.length,
    error: result.error,
    polledAt: result.polledAt,
    ageSeconds,
  };
}

export function buildAllPollStatuses(
  results: PollResult[],
  now: Date = new Date()
): HostPollStatus[] {
  return results.map((r) => buildPollStatus(r, now));
}

export function renderPollStatusLine(status: HostPollStatus): string {
  const icon = status.ok ? '✓' : '✗';
  const age = `${status.ageSeconds}s ago`;
  const jobs = `${status.jobCount} job${status.jobCount !== 1 ? 's' : ''}`;
  const err = status.error ? ` [${status.error}]` : '';
  return `${icon} ${status.host.padEnd(20)} ${jobs.padEnd(12)} polled ${age}${err}`;
}

export function renderPollStatusReport(statuses: HostPollStatus[]): string {
  if (statuses.length === 0) return 'No remote hosts configured.';
  const lines = statuses.map(renderPollStatusLine);
  const healthy = statuses.filter((s) => s.ok).length;
  const summary = `\n${healthy}/${statuses.length} hosts healthy`;
  return lines.join('\n') + summary;
}

export function getStaleHosts(
  statuses: HostPollStatus[],
  thresholdSeconds = 120
): HostPollStatus[] {
  return statuses.filter((s) => s.ageSeconds > thresholdSeconds);
}
