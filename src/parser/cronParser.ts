import { CronJob } from '../types/cronJob';

const CRON_FIELD_NAMES = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'] as const;

export function parseCrontabLine(line: string, source: string): CronJob | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length < 6) {
    return null;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek, ...commandParts] = parts;
  const command = commandParts.join(' ');

  if (!command) {
    return null;
  }

  return {
    id: `${source}:${trimmed}`,
    schedule: { minute, hour, dayOfMonth, month, dayOfWeek },
    command,
    source,
    raw: trimmed,
  };
}

export function parseCrontab(content: string, source: string): CronJob[] {
  return content
    .split('\n')
    .map((line) => parseCrontabLine(line, source))
    .filter((job): job is CronJob => job !== null);
}

export function describeSchedule(schedule: CronJob['schedule']): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = schedule;

  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute';
  }
  if (minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Daily at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Daily at midnight';
  }

  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}
