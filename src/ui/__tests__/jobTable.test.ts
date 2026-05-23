import { renderTableHeader, renderJobRow, renderJobTable } from '../jobTable';
import { CronJob } from '../../types/cronJob';

const mockJob: CronJob = {
  id: 'job-1',
  schedule: '*/5 * * * *',
  command: 'echo hello',
  host: 'localhost',
  lastRun: new Date('2024-01-01T10:00:00Z'),
  enabled: true,
};

const now = new Date('2024-01-01T10:04:00Z');

describe('renderTableHeader', () => {
  it('should include all column labels', () => {
    const header = renderTableHeader();
    expect(header).toMatch(/STATUS/);
    expect(header).toMatch(/SCHEDULE/);
    expect(header).toMatch(/COMMAND/);
    expect(header).toMatch(/NEXT RUN/);
    expect(header).toMatch(/HOST/);
  });

  it('should include a divider line', () => {
    const header = renderTableHeader();
    expect(header).toContain('─');
  });
});

describe('renderJobRow', () => {
  it('should include the job command', () => {
    const row = renderJobRow(mockJob, now);
    expect(row).toContain('echo hello');
  });

  it('should include the job schedule', () => {
    const row = renderJobRow(mockJob, now);
    expect(row).toContain('*/5 * * * *');
  });

  it('should include the host', () => {
    const row = renderJobRow(mockJob, now);
    expect(row).toContain('localhost');
  });

  it('should truncate long commands', () => {
    const longJob: CronJob = { ...mockJob, command: 'a'.repeat(60) };
    const row = renderJobRow(longJob, now);
    expect(row).toContain('…');
  });
});

describe('renderJobTable', () => {
  it('should return a no-jobs message when list is empty', () => {
    const output = renderJobTable([], now);
    expect(output).toContain('No cron jobs found.');
  });

  it('should render header and rows for multiple jobs', () => {
    const jobs: CronJob[] = [
      mockJob,
      { ...mockJob, id: 'job-2', command: 'backup.sh', host: 'remote-1' },
    ];
    const output = renderJobTable(jobs, now);
    expect(output).toContain('COMMAND');
    expect(output).toContain('echo hello');
    expect(output).toContain('backup.sh');
  });
});
