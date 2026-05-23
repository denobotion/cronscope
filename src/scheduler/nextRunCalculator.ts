import { CronJob } from '../types/cronJob';

/**
 * Calculates the next N run times for a given cron expression.
 */
export function getNextRuns(cronExpression: string, count: number = 5, from: Date = new Date()): Date[] {
  const parts = cronExpression.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(`Invalid cron expression: "${cronExpression}"`);
  }

  const [minuteExpr, hourExpr, domExpr, monthExpr, dowExpr] = parts;
  const results: Date[] = [];
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 60 * 24 * 366;
  let iterations = 0;

  while (results.length < count && iterations < maxIterations) {
    iterations++;
    if (
      matchField(cursor.getMonth() + 1, monthExpr, 1, 12) &&
      matchField(cursor.getDate(), domExpr, 1, 31) &&
      matchField(cursor.getDay(), dowExpr, 0, 6) &&
      matchField(cursor.getHours(), hourExpr, 0, 23) &&
      matchField(cursor.getMinutes(), minuteExpr, 0, 59)
    ) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  return results;
}

export function getNextRunsForJob(job: CronJob, count: number = 5): Date[] {
  return getNextRuns(job.schedule, count);
}

function matchField(value: number, expr: string, min: number, max: number): boolean {
  if (expr === '*') return true;

  const allowed = new Set<number>();

  for (const part of expr.split(',')) {
    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      const start = range === '*' ? min : parseInt(range.split('-')[0], 10);
      const end = range === '*' ? max : (range.includes('-') ? parseInt(range.split('-')[1], 10) : max);
      for (let i = start; i <= end; i += step) allowed.add(i);
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) allowed.add(i);
    } else {
      allowed.add(parseInt(part, 10));
    }
  }

  return allowed.has(value);
}
