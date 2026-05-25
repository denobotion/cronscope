import {
  createSortState,
  toggleSortDirection,
  setSortField,
  applySortToJobs,
  renderSortIndicator,
  SortState,
} from '../sortManager';
import { CronJob } from '../../types/cronJob';

function makeJob(overrides: Partial<CronJob> = {}): CronJob {
  return {
    id: 'job-1',
    schedule: '* * * * *',
    command: 'echo hello',
    host: 'localhost',
    status: 'ok',
    ...overrides,
  } as CronJob;
}

describe('createSortState', () => {
  it('creates default state', () => {
    const state = createSortState();
    expect(state.field).toBe('name');
    expect(state.direction).toBe('asc');
  });

  it('accepts custom field and direction', () => {
    const state = createSortState('status', 'desc');
    expect(state.field).toBe('status');
    expect(state.direction).toBe('desc');
  });
});

describe('toggleSortDirection', () => {
  it('toggles asc to desc', () => {
    const state: SortState = { field: 'name', direction: 'asc' };
    expect(toggleSortDirection(state).direction).toBe('desc');
  });

  it('toggles desc to asc', () => {
    const state: SortState = { field: 'name', direction: 'desc' };
    expect(toggleSortDirection(state).direction).toBe('asc');
  });
});

describe('setSortField', () => {
  it('sets a new field with asc direction', () => {
    const state = createSortState('name', 'desc');
    const next = setSortField(state, 'status');
    expect(next.field).toBe('status');
    expect(next.direction).toBe('asc');
  });

  it('toggles direction if same field', () => {
    const state = createSortState('name', 'asc');
    const next = setSortField(state, 'name');
    expect(next.field).toBe('name');
    expect(next.direction).toBe('desc');
  });
});

describe('applySortToJobs', () => {
  const jobs = [
    makeJob({ id: '1', name: 'zebra', host: 'b-host' }),
    makeJob({ id: '2', name: 'alpha', host: 'a-host' }),
    makeJob({ id: '3', name: 'mango', host: 'c-host' }),
  ];

  it('sorts by name ascending', () => {
    const state = createSortState('name', 'asc');
    const result = applySortToJobs(jobs, state);
    expect(result.map(j => j.name)).toEqual(['alpha', 'mango', 'zebra']);
  });

  it('sorts by name descending', () => {
    const state = createSortState('name', 'desc');
    const result = applySortToJobs(jobs, state);
    expect(result.map(j => j.name)).toEqual(['zebra', 'mango', 'alpha']);
  });

  it('sorts by host ascending', () => {
    const state = createSortState('host', 'asc');
    const result = applySortToJobs(jobs, state);
    expect(result.map(j => j.host)).toEqual(['a-host', 'b-host', 'c-host']);
  });

  it('does not mutate original array', () => {
    const original = [...jobs];
    applySortToJobs(jobs, createSortState('name', 'asc'));
    expect(jobs).toEqual(original);
  });
});

describe('renderSortIndicator', () => {
  it('returns asc indicator for active field', () => {
    const state = createSortState('name', 'asc');
    expect(renderSortIndicator(state, 'name')).toBe(' ▲');
  });

  it('returns desc indicator for active field', () => {
    const state = createSortState('name', 'desc');
    expect(renderSortIndicator(state, 'name')).toBe(' ▼');
  });

  it('returns empty for inactive field', () => {
    const state = createSortState('name', 'asc');
    expect(renderSortIndicator(state, 'status')).toBe('  ');
  });
});
