import {
  createMultiSelectState,
  toggleSelectJob,
  selectRange,
  clearSelection,
  selectAll,
  getSelectedJobs,
  renderSelectionSummary,
} from '../multiSelectManager';
import { CronJob } from '../../types/cronJob';

function makeJob(id: string): CronJob {
  return {
    id,
    schedule: '* * * * *',
    command: `echo ${id}`,
    host: 'localhost',
    user: 'root',
    enabled: true,
    rawLine: `* * * * * echo ${id}`,
  } as CronJob;
}

const jobs = [makeJob('a'), makeJob('b'), makeJob('c'), makeJob('d')];

describe('createMultiSelectState', () => {
  it('initializes with empty selection', () => {
    const state = createMultiSelectState();
    expect(state.selectedKeys.size).toBe(0);
    expect(state.active).toBe(false);
    expect(state.anchorKey).toBeNull();
  });
});

describe('toggleSelectJob', () => {
  it('selects a job', () => {
    const state = toggleSelectJob(createMultiSelectState(), 'a');
    expect(state.selectedKeys.has('a')).toBe(true);
    expect(state.active).toBe(true);
  });

  it('deselects an already selected job', () => {
    let state = toggleSelectJob(createMultiSelectState(), 'a');
    state = toggleSelectJob(state, 'a');
    expect(state.selectedKeys.has('a')).toBe(false);
    expect(state.active).toBe(false);
  });
});

describe('selectRange', () => {
  it('selects jobs between two keys inclusive', () => {
    const state = selectRange(createMultiSelectState(), jobs, 'a', 'c');
    expect(state.selectedKeys.has('a')).toBe(true);
    expect(state.selectedKeys.has('b')).toBe(true);
    expect(state.selectedKeys.has('c')).toBe(true);
    expect(state.selectedKeys.has('d')).toBe(false);
  });

  it('handles reverse range', () => {
    const state = selectRange(createMultiSelectState(), jobs, 'c', 'a');
    expect(state.selectedKeys.size).toBe(3);
  });

  it('returns unchanged state for unknown keys', () => {
    const initial = createMultiSelectState();
    const state = selectRange(initial, jobs, 'x', 'y');
    expect(state.selectedKeys.size).toBe(0);
  });
});

describe('selectAll', () => {
  it('selects all jobs', () => {
    const state = selectAll(createMultiSelectState(), jobs);
    expect(state.selectedKeys.size).toBe(jobs.length);
  });
});

describe('clearSelection', () => {
  it('clears all selections', () => {
    let state = selectAll(createMultiSelectState(), jobs);
    state = clearSelection(state);
    expect(state.selectedKeys.size).toBe(0);
    expect(state.active).toBe(false);
  });
});

describe('getSelectedJobs', () => {
  it('returns only selected jobs', () => {
    let state = toggleSelectJob(createMultiSelectState(), 'b');
    state = toggleSelectJob(state, 'd');
    const selected = getSelectedJobs(state, jobs);
    expect(selected.map((j) => j.id)).toEqual(['b', 'd']);
  });
});

describe('renderSelectionSummary', () => {
  it('returns empty string when nothing selected', () => {
    expect(renderSelectionSummary(createMultiSelectState())).toBe('');
  });

  it('renders singular for one job', () => {
    const state = toggleSelectJob(createMultiSelectState(), 'a');
    expect(renderSelectionSummary(state)).toBe('1 job selected');
  });

  it('renders plural for multiple jobs', () => {
    const state = selectAll(createMultiSelectState(), jobs);
    expect(renderSelectionSummary(state)).toBe('4 jobs selected');
  });
});
