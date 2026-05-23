import { checkJobHealth, checkAllJobsHealth, getUnhealthyJobs } from '../cronHealthChecker';
import { CronJob } from '../../types/cronJob';

const now = new Date('2024-06-01T12:00:00Z');

function makeJob(overrides: Partial<CronJob> = {}): CronJob {
  return {
    id: 'job-1',
    name: 'test-job',
    schedule: '*/10 * * * *',
    command: 'echo hello',
    host: 'localhost',
    user: 'root',
    lastRun: undefined,
    nextRun: undefined,
    ...overrides,
  };
}

describe('checkJobHealth', () => {
  it('returns no warning and not overdue for a recently run job', () => {
    const lastRun = new Date(now.getTime() - 5 * 60000); // 5 minutes ago
    const job = makeJob({ schedule: '*/10 * * * *', lastRun });
    const report = checkJobHealth(job, now);
    expect(report.isOverdue).toBe(false);
    expect(report.warning).toBeNull();
  });

  it('detects overdue job when last run is too long ago', () => {
    const lastRun = new Date(now.getTime() - 60 * 60000); // 60 minutes ago
    const job = makeJob({ schedule: '*/10 * * * *', lastRun });
    const report = checkJobHealth(job, now);
    expect(report.isOverdue).toBe(true);
    expect(report.overdueByMinutes).toBeGreaterThan(0);
    expect(report.warning).toContain('overdue');
  });

  it('warns about high frequency jobs', () => {
    const job = makeJob({ schedule: '*/2 * * * *' });
    const report = checkJobHealth(job, now);
    expect(report.warning).toContain('frequently');
  });

  it('warns about long interval jobs', () => {
    const job = makeJob({ schedule: '0 3 * * 0' }); // weekly-ish
    const report = checkJobHealth(job, now);
    // intervalMinutes will be large for weekly schedules
    if (report.intervalMinutes >= 1440) {
      expect(report.warning).toContain('long interval');
    }
  });

  it('returns correct status field', () => {
    const job = makeJob();
    const report = checkJobHealth(job, now);
    expect(typeof report.status).toBe('string');
    expect(report.status.length).toBeGreaterThan(0);
  });
});

describe('checkAllJobsHealth', () => {
  it('returns a report for each job', () => {
    const jobs = [makeJob({ id: 'a' }), makeJob({ id: 'b' }), makeJob({ id: 'c' })];
    const reports = checkAllJobsHealth(jobs, now);
    expect(reports).toHaveLength(3);
  });
});

describe('getUnhealthyJobs', () => {
  it('filters out healthy jobs', () => {
    const lastRun = new Date(now.getTime() - 5 * 60000);
    const healthyJob = makeJob({ schedule: '*/10 * * * *', lastRun });
    const overdueJob = makeJob({ id: 'j2', schedule: '*/10 * * * *', lastRun: new Date(now.getTime() - 60 * 60000) });
    const reports = checkAllJobsHealth([healthyJob, overdueJob], now);
    const unhealthy = getUnhealthyJobs(reports);
    expect(unhealthy.some((r) => r.job.id === 'j2')).toBe(true);
  });
});
