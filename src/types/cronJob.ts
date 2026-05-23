export interface CronSchedule {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface CronJob {
  id: string;
  schedule: CronSchedule;
  command: string;
  source: string;
  raw: string;
  user?: string;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ParseResult {
  jobs: CronJob[];
  errors: ParseError[];
  source: string;
}

export interface ParseError {
  line: number;
  content: string;
  reason: string;
}
