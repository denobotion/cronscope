import { CronJob } from '../types/cronJob';
import { getNextRuns } from '../scheduler/nextRunCalculator';
import { colorizeStatus } from './jobTable';

const PANEL_WIDTH = 60;

function pad(str: string, width: number, char = ' '): string {
  return str + char.repeat(Math.max(0, width - str.length));
}

function renderPanelBorder(title = ''): string {
  const titleStr = title ? ` ${title} ` : '';
  const dashes = '─'.repeat(Math.max(0, PANEL_WIDTH - titleStr.length - 2));
  return `┌${titleStr}${dashes}┐`;
}

function renderPanelRow(label: string, value: string): string {
  const content = `  ${label.padEnd(18)}: ${value}`;
  return `│${pad(content, PANEL_WIDTH)}│`;
}

function renderPanelDivider(): string {
  return `├${'─'.repeat(PANEL_WIDTH)}┤`;
}

function renderPanelBottom(): string {
  return `└${'─'.repeat(PANEL_WIDTH)}┘`;
}

export function renderDetailPanel(job: CronJob): string {
  const nextRuns = getNextRuns(job.schedule, new Date(), 3);
  const nextRunStrings = nextRuns.map(d => d.toLocaleString());

  const lines: string[] = [];
  lines.push(renderPanelBorder('Job Detail'));
  lines.push(renderPanelRow('Name', job.name || '(unnamed)'));
  lines.push(renderPanelRow('Schedule', job.schedule));
  lines.push(renderPanelRow('Command', job.command.slice(0, 35) + (job.command.length > 35 ? '…' : '')));
  lines.push(renderPanelRow('User', job.user || 'root'));
  lines.push(renderPanelRow('Host', job.host || 'localhost'));
  lines.push(renderPanelRow('Status', colorizeStatus(job.status)));
  lines.push(renderPanelDivider());
  lines.push(renderPanelRow('Next Run 1', nextRunStrings[0] || 'N/A'));
  lines.push(renderPanelRow('Next Run 2', nextRunStrings[1] || 'N/A'));
  lines.push(renderPanelRow('Next Run 3', nextRunStrings[2] || 'N/A'));
  if (job.lastRun) {
    lines.push(renderPanelRow('Last Run', new Date(job.lastRun).toLocaleString()));
  }
  if (job.tags && job.tags.length > 0) {
    lines.push(renderPanelRow('Tags', job.tags.join(', ')));
  }
  lines.push(renderPanelBottom());

  return lines.join('\n');
}
