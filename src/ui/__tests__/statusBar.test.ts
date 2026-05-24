import {
  buildStatusBarState,
  formatRefreshedTime,
  renderStatusBar,
  StatusBarState,
} from '../statusBar';
import { CronJob } from '../../types/cronJob';
import { JobHealthWarning } from '../../scheduler/cronHealthChecker';

function makeJob(id: string, enabled = true): CronJob {
  return {
    id,
    schedule: '* * * * *',
    command: 'echo test',
    enabled,
    source: 'local',
  } as CronJob;
}

function makeWarning(severity: 'warning' | 'error'): JobHealthWarning {
  return { jobId: 'j1', severity, message: 'test warning' } as JobHealthWarning;
}

describe('buildStatusBarState', () => {
  it('counts total and active jobs', () => {
    const jobs = [makeJob('a'), makeJob('b'), makeJob('c', false)];
    const state = buildStatusBarState(jobs, [], 'myhost');
    expect(state.totalJobs).toBe(3);
    expect(state.activeJobs).toBe(2);
    expect(state.host).toBe('myhost');
  });

  it('counts warnings and errors separately', () => {
    const warnings = [makeWarning('warning'), makeWarning('error'), makeWarning('error')];
    const state = buildStatusBarState([], warnings);
    expect(state.warningCount).toBe(1);
    expect(state.errorCount).toBe(2);
  });

  it('defaults host to localhost', () => {
    const state = buildStatusBarState([], []);
    expect(state.host).toBe('localhost');
  });

  it('sets lastRefreshed to a recent date', () => {
    const before = Date.now();
    const state = buildStatusBarState([], []);
    expect(state.lastRefreshed.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe('formatRefreshedTime', () => {
  it('formats time as HH:MM:SS', () => {
    const d = new Date('2024-01-15T14:30:45');
    const result = formatRefreshedTime(d);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe('renderStatusBar', () => {
  it('includes host, job counts, and refresh time', () => {
    const state: StatusBarState = {
      totalJobs: 10,
      activeJobs: 8,
      warningCount: 2,
      errorCount: 1,
      lastRefreshed: new Date('2024-06-01T09:00:00'),
      host: 'prod-server',
    };
    const output = renderStatusBar(state, 100);
    expect(output).toContain('prod-server');
    expect(output).toContain('8/10');
    expect(output).toContain('Warnings: 2');
    expect(output).toContain('Errors: 1');
  });

  it('returns a non-empty string', () => {
    const state = buildStatusBarState([makeJob('x')], []);
    expect(renderStatusBar(state).length).toBeGreaterThan(0);
  });
});
