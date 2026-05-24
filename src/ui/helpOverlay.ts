import { KeyBinding } from '../types/cronJob';

const KEY_BINDINGS: KeyBinding[] = [
  { key: '↑ / k', description: 'Move selection up' },
  { key: '↓ / j', description: 'Move selection down' },
  { key: 'Enter', description: 'View job details' },
  { key: 'Esc', description: 'Close detail / help panel' },
  { key: '/', description: 'Open search bar' },
  { key: 'f', description: 'Cycle status filter' },
  { key: 's', description: 'Cycle sort order' },
  { key: 'e', description: 'Export jobs (JSON/CSV/Markdown)' },
  { key: 'a', description: 'View audit log' },
  { key: 'r', description: 'Refresh / re-poll remote hosts' },
  { key: 'h / ?', description: 'Toggle this help overlay' },
  { key: 'q', description: 'Quit cronscope' },
];

export function renderHelpRow(key: string, description: string, width: number): string {
  const keyCol = key.padEnd(14);
  const descCol = description.padEnd(width - 18);
  return `│  ${keyCol}  ${descCol}│`;
}

export function renderHelpOverlay(termWidth: number): string[] {
  const width = Math.min(60, termWidth - 4);
  const title = ' Keyboard Shortcuts ';
  const top = '┌' + '─'.repeat(width - 2) + '┐';
  const divider = '├' + '─'.repeat(width - 2) + '┤';
  const bottom = '└' + '─'.repeat(width - 2) + '┘';
  const titlePad = Math.floor((width - 2 - title.length) / 2);
  const titleLine = '│' + ' '.repeat(titlePad) + title + ' '.repeat(width - 2 - titlePad - title.length) + '│';

  const lines: string[] = [top, titleLine, divider];

  for (const binding of KEY_BINDINGS) {
    lines.push(renderHelpRow(binding.key, binding.description, width));
  }

  lines.push(bottom);
  return lines;
}

export function isHelpKey(input: string): boolean {
  return input === 'h' || input === '?';
}
