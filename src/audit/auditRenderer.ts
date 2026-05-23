import { AuditEntry } from './auditLogger';

const EVENT_COLORS: Record<AuditEntry['event'], string> = {
  job_added: '\x1b[32m',
  job_removed: '\x1b[31m',
  job_changed: '\x1b[33m',
  health_warning: '\x1b[35m',
  poll_error: '\x1b[31m',
};

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

export function renderAuditEntry(entry: AuditEntry): string {
  const color = EVENT_COLORS[entry.event] ?? '';
  const ts = DIM + entry.timestamp + RESET;
  const event = color + entry.event.padEnd(16) + RESET;
  const host = entry.host.padEnd(20);
  return `${ts}  ${event}  ${host}  ${entry.message}`;
}

export function renderAuditTable(entries: AuditEntry[], maxRows = 20): string {
  const lines: string[] = [];
  const header = [
    'TIMESTAMP'.padEnd(26),
    'EVENT'.padEnd(16),
    'HOST'.padEnd(20),
    'MESSAGE',
  ].join('  ');

  lines.push('\x1b[1m' + header + RESET);
  lines.push('─'.repeat(90));

  const visible = entries.slice(-maxRows);
  for (const entry of visible) {
    lines.push(renderAuditEntry(entry));
  }

  if (entries.length > maxRows) {
    lines.push(DIM + `  ... ${entries.length - maxRows} earlier entries hidden` + RESET);
  }

  return lines.join('\n');
}

export function renderAuditSummary(entries: AuditEntry[]): string {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.event] = (counts[e.event] ?? 0) + 1;
  }
  const parts = Object.entries(counts).map(
    ([event, count]) => `${EVENT_COLORS[event as AuditEntry['event']]}${event}: ${count}${RESET}`
  );
  return 'Audit summary — ' + (parts.length ? parts.join('  ') : 'no events');
}
