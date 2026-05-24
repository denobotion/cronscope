import { AuditEntry } from '../types/cronJob';

export function auditEntriesToCsv(entries: AuditEntry[]): string {
  const header = 'timestamp,host,jobKey,changeType,field,oldValue,newValue';
  const rows = entries.map((e) => {
    const changes = e.changes ?? [];
    if (changes.length === 0) {
      return [
        e.timestamp,
        e.host ?? '',
        e.jobKey,
        e.changeType,
        '',
        '',
        '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    }
    return changes
      .map((c) =>
        [
          e.timestamp,
          e.host ?? '',
          e.jobKey,
          e.changeType,
          c.field,
          c.oldValue ?? '',
          c.newValue ?? '',
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
  });
  return [header, ...rows].join('\n');
}

export function auditEntriesToMarkdown(entries: AuditEntry[]): string {
  const lines: string[] = [
    '# Audit Log',
    '',
    '| Timestamp | Host | Job Key | Change Type | Details |',
    '|-----------|------|---------|-------------|---------|',
  ];
  for (const e of entries) {
    const details =
      (e.changes ?? [])
        .map((c) => `${c.field}: ${c.oldValue ?? '—'} → ${c.newValue ?? '—'}`)
        .join('; ') || '—';
    lines.push(
      `| ${e.timestamp} | ${e.host ?? ''} | ${e.jobKey} | ${e.changeType} | ${details} |`
    );
  }
  return lines.join('\n');
}

export function auditEntriesToJson(entries: AuditEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export type AuditExportFormat = 'json' | 'csv' | 'markdown';

export function exportAuditLog(
  entries: AuditEntry[],
  format: AuditExportFormat
): string {
  switch (format) {
    case 'csv':
      return auditEntriesToCsv(entries);
    case 'markdown':
      return auditEntriesToMarkdown(entries);
    case 'json':
    default:
      return auditEntriesToJson(entries);
  }
}
