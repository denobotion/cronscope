import { getNextRuns } from '../nextRunCalculator';

describe('getNextRuns', () => {
  const baseDate = new Date('2024-01-15T10:00:00Z');

  it('returns the correct number of next runs', () => {
    const runs = getNextRuns('* * * * *', 5, baseDate);
    expect(runs).toHaveLength(5);
  });

  it('every minute expression increments by 1 minute each time', () => {
    const runs = getNextRuns('* * * * *', 3, baseDate);
    expect(runs[1].getTime() - runs[0].getTime()).toBe(60000);
    expect(runs[2].getTime() - runs[1].getTime()).toBe(60000);
  });

  it('handles hourly cron expression', () => {
    const runs = getNextRuns('0 * * * *', 2, baseDate);
    expect(runs[0].getMinutes()).toBe(0);
    expect(runs[0].getHours()).toBe(11);
    expect(runs[1].getHours()).toBe(12);
  });

  it('handles step expressions like */15', () => {
    const runs = getNextRuns('*/15 * * * *', 4, baseDate);
    const minutes = runs.map((d) => d.getMinutes());
    expect(minutes).toEqual([15, 30, 45, 0]);
  });

  it('handles specific minute and hour', () => {
    const runs = getNextRuns('30 9 * * *', 1, baseDate);
    expect(runs[0].getHours()).toBe(9);
    expect(runs[0].getMinutes()).toBe(30);
    expect(runs[0].getDate()).toBe(16);
  });

  it('throws on invalid expression', () => {
    expect(() => getNextRuns('bad expression', 1, baseDate)).toThrow(
      'Invalid cron expression'
    );
  });

  it('handles day-of-week filtering', () => {
    // Monday = 1; baseDate is a Monday
    const runs = getNextRuns('0 12 * * 1', 2, baseDate);
    runs.forEach((run) => {
      expect(run.getDay()).toBe(1);
      expect(run.getHours()).toBe(12);
    });
  });
});
