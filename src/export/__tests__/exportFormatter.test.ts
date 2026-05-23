import { exportToJson, exportToCsv, exportToMarkdown, formatExport } from '../exportFormatter';
import { CronJob } from '../../types/cronJob';

const mockJobs: CronJob[] = [
  {
    id: 'job-1',
    schedule: '0 * * * *',
    command: '/usr/bin/backup.sh',
    host: 'server-01',
    user: 'root',
    status: 'ok',
    nextRun: new Date('2024-06-01T12:00:00.000Z'),
    lastRun: new Date('2024-06-01T11:00:00.000Z'),
  },
  {
    id: 'job-2',
    schedule: '*/5 * * * *',
    command: 'echo "hello, world"',
    host: 'server-02',
    user: 'deploy',
    status: 'warning',
    nextRun: new Date('2024-06-01T12:05:00.000Z'),
    lastRun: undefined,
  },
];

describe('exportToJson', () => {
  it('produces valid JSON with all fields', () => {
    const result = exportToJson(mockJobs);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('job-1');
    expect(parsed[1].command).toBe('echo "hello, world"');
  });
});

describe('exportToCsv', () => {
  it('includes header row', () => {
    const result = exportToCsv(mockJobs);
    expect(result.startsWith('id,schedule,command')).toBe(true);
  });

  it('escapes double quotes in commands', () => {
    const result = exportToCsv(mockJobs);
    expect(result).toContain('"echo ""hello, world"""');
  });

  it('produces correct number of rows', () => {
    const lines = exportToCsv(mockJobs).split('\n');
    expect(lines).toHaveLength(3); // header + 2 jobs
  });
});

describe('exportToMarkdown', () => {
  it('includes header and divider', () => {
    const result = exportToMarkdown(mockJobs);
    expect(result).toContain('| ID |');
    expect(result).toContain('|---|');
  });

  it('renders schedule as inline code', () => {
    const result = exportToMarkdown(mockJobs);
    expect(result).toContain('`0 * * * *`');
  });
});

describe('formatExport', () => {
  it('delegates to correct formatter', () => {
    expect(() => formatExport(mockJobs, 'json')).not.toThrow();
    expect(() => formatExport(mockJobs, 'csv')).not.toThrow();
    expect(() => formatExport(mockJobs, 'markdown')).not.toThrow();
  });

  it('throws for unsupported format', () => {
    expect(() => formatExport(mockJobs, 'xml' as any)).toThrow('Unsupported export format');
  });
});
