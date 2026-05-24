import {
  auditEntriesToCsv,
  auditEntriesToMarkdown,
  auditEntriesToJson,
  exportAuditLog,
} from '../auditExporter';
import { AuditEntry } from '../../types/cronJob';

const makeEntry = (overrides: Partial<AuditEntry> = {}): AuditEntry => ({
  timestamp: '2024-01-15T10:00:00Z',
  jobKey: 'localhost:backup',
  changeType: 'modified',
  host: 'localhost',
  changes: [
    { field: 'schedule', oldValue: '0 * * * *', newValue: '30 * * * *' },
  ],
  ...overrides,
});

describe('auditEntriesToCsv', () => {
  it('includes header row', () => {
    const result = auditEntriesToCsv([]);
    expect(result).toContain('timestamp,host,jobKey,changeType,field,oldValue,newValue');
  });

  it('renders a change row with correct fields', () => {
    const result = auditEntriesToCsv([makeEntry()]);
    expect(result).toContain('localhost:backup');
    expect(result).toContain('schedule');
    expect(result).toContain('0 * * * *');
    expect(result).toContain('30 * * * *');
  });

  it('renders entry with no changes as single row', () => {
    const entry = makeEntry({ changes: [] });
    const result = auditEntriesToCsv([entry]);
    const lines = result.trim().split('\n');
    expect(lines).toHaveLength(2);
  });

  it('escapes double quotes in values', () => {
    const entry = makeEntry({
      changes: [{ field: 'command', oldValue: 'echo "hi"', newValue: 'echo "bye"' }],
    });
    const result = auditEntriesToCsv([entry]);
    expect(result).toContain('""hi""');
  });
});

describe('auditEntriesToMarkdown', () => {
  it('includes markdown table header', () => {
    const result = auditEntriesToMarkdown([]);
    expect(result).toContain('| Timestamp |');
    expect(result).toContain('|-----------|');
  });

  it('renders change details inline', () => {
    const result = auditEntriesToMarkdown([makeEntry()]);
    expect(result).toContain('schedule: 0 * * * * → 30 * * * *');
  });

  it('shows dash for entries with no changes', () => {
    const result = auditEntriesToMarkdown([makeEntry({ changes: [] })]);
    expect(result).toContain('| — |');
  });
});

describe('auditEntriesToJson', () => {
  it('returns valid JSON array', () => {
    const entries = [makeEntry()];
    const result = auditEntriesToJson(entries);
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].jobKey).toBe('localhost:backup');
  });
});

describe('exportAuditLog', () => {
  it('delegates to csv formatter', () => {
    const result = exportAuditLog([makeEntry()], 'csv');
    expect(result).toContain('timestamp,host,jobKey');
  });

  it('delegates to markdown formatter', () => {
    const result = exportAuditLog([makeEntry()], 'markdown');
    expect(result).toContain('# Audit Log');
  });

  it('defaults to json formatter', () => {
    const result = exportAuditLog([makeEntry()], 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
