import { createAuditEntry, appendAuditEntry, filterAuditLog, AuditLog } from '../auditLogger';

describe('createAuditEntry', () => {
  it('creates an entry with correct fields', () => {
    const entry = createAuditEntry('job_added', 'localhost', 'backup.sh', 'Job added', { schedule: '0 * * * *' });
    expect(entry.event).toBe('job_added');
    expect(entry.host).toBe('localhost');
    expect(entry.jobId).toBe('backup.sh');
    expect(entry.message).toBe('Job added');
    expect(entry.details).toEqual({ schedule: '0 * * * *' });
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('appendAuditEntry', () => {
  it('appends an entry to the log immutably', () => {
    const log: AuditLog = { entries: [] };
    const entry = createAuditEntry('poll_error', 'host1', 'cmd', 'error');
    const updated = appendAuditEntry(log, entry);
    expect(updated.entries).toHaveLength(1);
    expect(log.entries).toHaveLength(0);
  });

  it('preserves existing entries', () => {
    const e1 = createAuditEntry('job_added', 'h', 'c', 'm');
    const e2 = createAuditEntry('job_removed', 'h', 'c', 'm');
    const log: AuditLog = { entries: [e1] };
    const updated = appendAuditEntry(log, e2);
    expect(updated.entries).toHaveLength(2);
    expect(updated.entries[0]).toBe(e1);
    expect(updated.entries[1]).toBe(e2);
  });
});

describe('filterAuditLog', () => {
  it('filters entries by event type', () => {
    const log: AuditLog = {
      entries: [
        createAuditEntry('job_added', 'h', 'c', 'm'),
        createAuditEntry('job_removed', 'h', 'c', 'm'),
        createAuditEntry('job_added', 'h', 'c2', 'm'),
      ],
    };
    const result = filterAuditLog(log, (e) => e.event === 'job_added');
    expect(result).toHaveLength(2);
  });

  it('returns empty array when no match', () => {
    const log: AuditLog = { entries: [createAuditEntry('poll_error', 'h', 'c', 'm')] };
    const result = filterAuditLog(log, (e) => e.event === 'job_added');
    expect(result).toHaveLength(0);
  });
});
