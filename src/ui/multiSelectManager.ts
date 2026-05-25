import { CronJob } from '../types/cronJob';

export interface MultiSelectState {
  selectedKeys: Set<string>;
  anchorKey: string | null;
  active: boolean;
}

export function createMultiSelectState(): MultiSelectState {
  return {
    selectedKeys: new Set(),
    anchorKey: null,
    active: false,
  };
}

export function toggleSelectJob(state: MultiSelectState, key: string): MultiSelectState {
  const selectedKeys = new Set(state.selectedKeys);
  if (selectedKeys.has(key)) {
    selectedKeys.delete(key);
  } else {
    selectedKeys.add(key);
  }
  return {
    ...state,
    selectedKeys,
    anchorKey: key,
    active: selectedKeys.size > 0,
  };
}

export function selectRange(
  state: MultiSelectState,
  jobs: CronJob[],
  fromKey: string,
  toKey: string
): MultiSelectState {
  const keys = jobs.map((j) => j.id);
  const fromIdx = keys.indexOf(fromKey);
  const toIdx = keys.indexOf(toKey);
  if (fromIdx === -1 || toIdx === -1) return state;
  const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
  const selectedKeys = new Set(state.selectedKeys);
  for (let i = start; i <= end; i++) {
    selectedKeys.add(keys[i]);
  }
  return { ...state, selectedKeys, anchorKey: toKey, active: selectedKeys.size > 0 };
}

export function clearSelection(state: MultiSelectState): MultiSelectState {
  return { selectedKeys: new Set(), anchorKey: null, active: false };
}

export function selectAll(state: MultiSelectState, jobs: CronJob[]): MultiSelectState {
  const selectedKeys = new Set(jobs.map((j) => j.id));
  return { ...state, selectedKeys, active: selectedKeys.size > 0 };
}

export function getSelectedJobs(state: MultiSelectState, jobs: CronJob[]): CronJob[] {
  return jobs.filter((j) => state.selectedKeys.has(j.id));
}

export function renderSelectionSummary(state: MultiSelectState): string {
  if (!state.active || state.selectedKeys.size === 0) return '';
  return `${state.selectedKeys.size} job${state.selectedKeys.size !== 1 ? 's' : ''} selected`;
}
