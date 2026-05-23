import { runExportCommand } from '../exportCommand';
import { CronJob } from '../../types/cronJob';

const mockJobs: CronJob[] = [
  {
    id: 'job-1',
    schedule: '0 2 * * *',
    command: '/usr/local/bin/cleanup',
    host: 'host-a',
    user: 'root',
    status: 'ok',
    nextRun: new Date('2024-06-02T02:00:00Z'),
  },
  {
    id: 'job-2',
    schedule: '*/10 * * * *',
    command: '/opt/health-check.sh',
    host: 'host-b',
    user: 'monitor',
    status: 'warning',
    nextRun: new Date('2024-06-01T12:10:00Z'),
  },
  {
    id: 'job-3',
    schedule: '0 0 * * 0',
    command: '/usr/bin/weekly-report',
    host: 'host-a',
    user: 'root',
    status: 'error',
    nextRun: new Date('2024-06-07T00:00:00Z'),
  },
];

describe('runExportCommand', () => {
  it('exports all jobs to stdout as JSON', () => {
    const result = runExportCommand(mockJobs, { format: 'json', stdout: true });
    expect(result.count).toBe(3);
    expect(result.writtenTo).toBeNull();
    expect(() => JSON.parse(result.output)).not.toThrow();
  });

  it('filters by host before exporting', () => {
    const result = runExportCommand(mockJobs, {
      format: 'csv',
      stdout: true,
      host: 'host-a',
    });
    expect(result.count).toBe(2);
  });

  it('filters by status before exporting', () => {
    const result = runExportCommand(mockJobs, {
      format: 'markdown',
      stdout: true,
      status: 'warning',
    });
    expect(result.count).toBe(1);
    expect(result.output).toContain('health-check');
  });

  it('filters by search query before exporting', () => {
    const result = runExportCommand(mockJobs, {
      format: 'json',
      stdout: true,
      query: 'cleanup',
    });
    expect(result.count).toBe(1);
  });

  it('returns writtenTo path when outputPath provided', () => {
    const tmpPath = `/tmp/cronscope-test-${Date.now()}.json`;
    const result = runExportCommand(mockJobs, {
      format: 'json',
      outputPath: tmpPath,
    });
    expect(result.writtenTo).toBe(tmpPath);
    const fs = require('fs');
    expect(fs.existsSync(tmpPath)).toBe(true);
    fs.unlinkSync(tmpPath);
  });
});
