import { diffJobSnapshots, diffToAuditEntries, JobSnapshot } from '../jobDiffDetector';
import { CronJob } from '../../types/cronJob';

function makeJob(command: string, schedule: string, host = 'localhost'): CronJob {
  return { command, schedule, host, enabled: true, user: 'root', raw: `${schedule} ${command}` } as CronJob;
}

describe('diffJobSnapshots', () => {
  it('detects added jobs', () => {
    const prev: JobSnapshot = { host: 'localhost', jobs: [] };
    const curr: JobSnapshot = { host: 'localhost', jobs: [makeJob('backup.sh', '0 * * * *')] };
    const diff = diffJobSnapshots(prev, curr);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].command).toBe('backup.sh');
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });

  it('detects removed jobs', () => {
    const prev: JobSnapshot = { host: 'localhost', jobs: [makeJob('cleanup.sh', '0 2 * * *')] };
    const curr: JobSnapshot = { host: 'localhost', jobs: [] };
    const diff = diffJobSnapshots(prev, curr);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].command).toBe('cleanup.sh');
  });

  it('detects changed schedule', () => {
    const prev: JobSnapshot = { host: 'localhost', jobs: [makeJob('sync.sh', '0 * * * *')] };
    const curr: JobSnapshot = { host: 'localhost', jobs: [makeJob('sync.sh', '30 * * * *')] };
    const diff = diffJobSnapshots(prev, curr);
    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].previous.schedule).toBe('0 * * * *');
    expect(diff.changed[0].current.schedule).toBe('30 * * * *');
  });

  it('returns empty diff when nothing changed', () => {
    const jobs = [makeJob('noop.sh', '* * * * *')];
    const snap: JobSnapshot = { host: 'localhost', jobs };
    const diff = diffJobSnapshots(snap, snap);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
  });
});

describe('diffToAuditEntries', () => {
  it('creates audit entries for all diff types', () => {
    const diff = {
      added: [makeJob('a.sh', '* * * * *')],
      removed: [makeJob('b.sh', '* * * * *')],
      changed: [{ previous: makeJob('c.sh', '0 * * * *'), current: makeJob('c.sh', '1 * * * *') }],
    };
    const entries = diffToAuditEntries(diff, 'localhost');
    expect(entries).toHaveLength(3);
    expect(entries[0].event).toBe('job_added');
    expect(entries[1].event).toBe('job_removed');
    expect(entries[2].event).toBe('job_changed');
  });
});
