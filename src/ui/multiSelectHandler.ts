import {
  MultiSelectState,
  toggleSelectJob,
  selectRange,
  clearSelection,
  selectAll,
} from './multiSelectManager';
import { CronJob } from '../types/cronJob';

export type MultiSelectAction =
  | { type: 'toggle'; key: string }
  | { type: 'range'; fromKey: string; toKey: string }
  | { type: 'selectAll' }
  | { type: 'clear' };

export function parseMultiSelectKey(
  input: string,
  cursorKey: string,
  anchorKey: string | null
): MultiSelectAction | null {
  if (input === ' ') return { type: 'toggle', key: cursorKey };
  if (input === 'S' && anchorKey) return { type: 'range', fromKey: anchorKey, toKey: cursorKey };
  if (input === 'a') return { type: 'selectAll' };
  if (input === 'escape' || input === 'Escape') return { type: 'clear' };
  return null;
}

export function applyMultiSelectAction(
  state: MultiSelectState,
  action: MultiSelectAction,
  jobs: CronJob[]
): MultiSelectState {
  switch (action.type) {
    case 'toggle':
      return toggleSelectJob(state, action.key);
    case 'range':
      return selectRange(state, jobs, action.fromKey, action.toKey);
    case 'selectAll':
      return selectAll(state, jobs);
    case 'clear':
      return clearSelection(state);
    default:
      return state;
  }
}

export function handleMultiSelectKey(
  input: string,
  state: MultiSelectState,
  cursorKey: string,
  jobs: CronJob[]
): MultiSelectState {
  const action = parseMultiSelectKey(input, cursorKey, state.anchorKey);
  if (!action) return state;
  return applyMultiSelectAction(state, action, jobs);
}
