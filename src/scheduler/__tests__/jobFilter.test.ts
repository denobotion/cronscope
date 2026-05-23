import { filterJobs, sortJobs } from '../jobFilter';
import { CronJob } from '../../types/cronJob';

const mockJobs: CronJob[] = [
  {
    id: '1',
    schedule: '0 * * * *',
    command: '/usr/bin/backup.sh',
    user: 'root',
    host: 'server-a',
    status: 'ok',
    disabled: false,
    nextRun: new Date('2024-01-01T02:00:00Z'),
  },
  {
    id: '2',
    schedule: '*/5 * * * *',
    command: '/opt/scripts/healthcheck.sh',
    user: 'deploy',
    host: 'server-b',
    status: 'warning',
    disabled: false,
    nextRun: new Date('2024-01-01T01:05:00Z'),
  },
  {
    id: '3',
    schedule: '0 0 * * *',
    command: '/usr/bin/cleanup.sh',
    user: 'root',
    host: 'server-a',
    status: 'error',
    disabled: true,
    comment: 'nightly cleanup',
    nextRun: new Date('2024-01-02T00:00:00Z'),
  },
];

describe('filterJobs', () => {
  it('filters by single status', () => {
    const result = filterJobs(mockJobs, { status: 'ok' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by multiple statuses', () => {
    const result = filterJobs(mockJobs, { status: ['ok', 'warning'] });
    expect(result).toHaveLength(2);
  });

  it('filters by user', () => {
    const result = filterJobs(mockJobs, { user: 'root' });
    expect(result).toHaveLength(2);
  });

  it('filters by host', () => {
    const result = filterJobs(mockJobs, { host: 'server-b' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters enabled only', () => {
    const result = filterJobs(mockJobs, { enabledOnly: true });
    expect(result).toHaveLength(2);
  });

  it('filters by search term in command', () => {
    const result = filterJobs(mockJobs, { search: 'backup' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by search term in comment', () => {
    const result = filterJobs(mockJobs, { search: 'nightly' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns all jobs when no filters applied', () => {
    const result = filterJobs(mockJobs, {});
    expect(result).toHaveLength(3);
  });
});

describe('sortJobs', () => {
  it('sorts by nextRun ascending', () => {
    const result = sortJobs(mockJobs, 'nextRun', 'asc');
    expect(result[0].id).toBe('2');
    expect(result[2].id).toBe('3');
  });

  it('sorts by nextRun descending', () => {
    const result = sortJobs(mockJobs, 'nextRun', 'desc');
    expect(result[0].id).toBe('3');
  });

  it('sorts by command ascending', () => {
    const result = sortJobs(mockJobs, 'command', 'asc');
    expect(result[0].command).toBe('/opt/scripts/healthcheck.sh');
  });
});
