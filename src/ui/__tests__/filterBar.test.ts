import {
  createFilterBarState,
  applyFilterBarInput,
  clearFilterBar,
  matchesFilterBar,
  applyFilterBarToJobs,
  renderFilterBar,
} from '../filterBar';
import { CronJob } from '../../types/cronJob';

function makeJob(overrides: Partial<CronJob> = {}): CronJob {
  return {
    id: 'job-1',
    schedule: '* * * * *',
    command: 'echo hi',
    host: 'localhost',
    status: 'ok',
    tags: ['web'],
    ...overrides,
  } as CronJob;
}

describe('createFilterBarState', () => {
  it('returns empty state', () => {
    const state = createFilterBarState();
    expect(state.status).toBeNull();
    expect(state.host).toBeNull();
    expect(state.tag).toBeNull();
    expect(state.activeField).toBeNull();
  });
});

describe('applyFilterBarInput', () => {
  it('sets a field value', () => {
    const state = createFilterBarState();
    const next = applyFilterBarInput(state, 'status', 'ok');
    expect(next.status).toBe('ok');
  });

  it('clears field when value is empty string', () => {
    const state = applyFilterBarInput(createFilterBarState(), 'host', 'prod');
    const next = applyFilterBarInput(state, 'host', '');
    expect(next.host).toBeNull();
  });
});

describe('clearFilterBar', () => {
  it('resets all fields', () => {
    const state = applyFilterBarInput(createFilterBarState(), 'status', 'error');
    const cleared = clearFilterBar(state);
    expect(cleared.status).toBeNull();
    expect(cleared.host).toBeNull();
  });
});

describe('matchesFilterBar', () => {
  it('returns true when no filters set', () => {
    expect(matchesFilterBar(makeJob(), createFilterBarState())).toBe(true);
  });

  it('filters by status', () => {
    const state = applyFilterBarInput(createFilterBarState(), 'status', 'error');
    expect(matchesFilterBar(makeJob({ status: 'ok' }), state)).toBe(false);
    expect(matchesFilterBar(makeJob({ status: 'error' }), state)).toBe(true);
  });

  it('filters by host', () => {
    const state = applyFilterBarInput(createFilterBarState(), 'host', 'prod');
    expect(matchesFilterBar(makeJob({ host: 'localhost' }), state)).toBe(false);
    expect(matchesFilterBar(makeJob({ host: 'prod' }), state)).toBe(true);
  });

  it('filters by tag', () => {
    const state = applyFilterBarInput(createFilterBarState(), 'tag', 'db');
    expect(matchesFilterBar(makeJob({ tags: ['web'] }), state)).toBe(false);
    expect(matchesFilterBar(makeJob({ tags: ['db', 'web'] }), state)).toBe(true);
  });
});

describe('applyFilterBarToJobs', () => {
  it('returns only matching jobs', () => {
    const jobs = [makeJob({ host: 'prod' }), makeJob({ host: 'staging' })];
    const state = applyFilterBarInput(createFilterBarState(), 'host', 'prod');
    expect(applyFilterBarToJobs(jobs, state)).toHaveLength(1);
  });
});

describe('renderFilterBar', () => {
  it('renders a string with field labels', () => {
    const output = renderFilterBar(createFilterBarState());
    expect(output).toContain('Status');
    expect(output).toContain('Host');
    expect(output).toContain('Tag');
  });

  it('highlights active field', () => {
    const state = { ...createFilterBarState(), activeField: 'host' as const };
    const output = renderFilterBar(state);
    expect(output).toContain('>');
  });
});
