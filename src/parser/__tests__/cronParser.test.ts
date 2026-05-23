import { parseCrontabLine, parseCrontab, describeSchedule } from '../cronParser';

describe('parseCrontabLine', () => {
  it('should return null for empty lines', () => {
    expect(parseCrontabLine('', 'local')).toBeNull();
    expect(parseCrontabLine('   ', 'local')).toBeNull();
  });

  it('should return null for comment lines', () => {
    expect(parseCrontabLine('# this is a comment', 'local')).toBeNull();
  });

  it('should parse a valid cron line', () => {
    const result = parseCrontabLine('0 5 * * * /usr/bin/backup.sh', 'local');
    expect(result).not.toBeNull();
    expect(result?.schedule.minute).toBe('0');
    expect(result?.schedule.hour).toBe('5');
    expect(result?.command).toBe('/usr/bin/backup.sh');
    expect(result?.source).toBe('local');
  });

  it('should handle commands with spaces', () => {
    const result = parseCrontabLine('*/5 * * * * /usr/bin/python3 /opt/script.py --verbose', 'remote');
    expect(result?.command).toBe('/usr/bin/python3 /opt/script.py --verbose');
  });

  it('should return null for lines with fewer than 6 fields', () => {
    expect(parseCrontabLine('0 5 * *', 'local')).toBeNull();
  });
});

describe('parseCrontab', () => {
  it('should parse multiple lines and skip comments', () => {
    const content = [
      '# Backup jobs',
      '0 2 * * * /usr/bin/backup.sh',
      '',
      '*/15 * * * * /usr/bin/healthcheck.sh',
    ].join('\n');

    const jobs = parseCrontab(content, 'local');
    expect(jobs).toHaveLength(2);
    expect(jobs[0].command).toBe('/usr/bin/backup.sh');
    expect(jobs[1].schedule.minute).toBe('*/15');
  });
});

describe('describeSchedule', () => {
  it('should describe every-minute schedule', () => {
    const schedule = { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
    expect(describeSchedule(schedule)).toBe('Every minute');
  });

  it('should describe a daily schedule', () => {
    const schedule = { minute: '30', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
    expect(describeSchedule(schedule)).toBe('Daily at 09:30');
  });
});
