import { renderDetailPanel } from '../detailPanel';
import { CronJob } from '../../types/cronJob';

const baseJob: CronJob = {
  id: 'job-1',
  name: 'Backup DB',
  schedule: '0 2 * * *',
  command: '/usr/bin/backup.sh',
  user: 'root',
  host: 'localhost',
  status: 'active',
  tags: ['backup', 'db'],
};

describe('renderDetailPanel', () => {
  it('renders a panel with job name', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('Backup DB');
  });

  it('renders schedule field', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('0 2 * * *');
  });

  it('renders command field', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('/usr/bin/backup.sh');
  });

  it('renders user and host', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('root');
    expect(output).toContain('localhost');
  });

  it('renders tags when present', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('backup, db');
  });

  it('renders next run entries', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('Next Run 1');
    expect(output).toContain('Next Run 2');
    expect(output).toContain('Next Run 3');
  });

  it('does not render tags row when tags are absent', () => {
    const jobNoTags: CronJob = { ...baseJob, tags: [] };
    const output = renderDetailPanel(jobNoTags);
    expect(output).not.toContain('Tags');
  });

  it('truncates long commands', () => {
    const longCmd = '/usr/bin/' + 'a'.repeat(50);
    const job: CronJob = { ...baseJob, command: longCmd };
    const output = renderDetailPanel(job);
    expect(output).toContain('…');
  });

  it('renders lastRun when provided', () => {
    const job: CronJob = { ...baseJob, lastRun: '2024-01-15T02:00:00Z' };
    const output = renderDetailPanel(job);
    expect(output).toContain('Last Run');
  });

  it('renders panel borders', () => {
    const output = renderDetailPanel(baseJob);
    expect(output).toContain('┌');
    expect(output).toContain('└');
    expect(output).toContain('│');
  });
});
