import { FilterBarState, applyFilterBarInput, clearFilterBar, createFilterBarState } from './filterBar';

export type FilterField = 'status' | 'host' | 'tag';

const FIELD_CYCLE: FilterField[] = ['status', 'host', 'tag'];

export function cycleActiveField(state: FilterBarState): FilterBarState {
  if (state.activeField === null) {
    return { ...state, activeField: FIELD_CYCLE[0] };
  }
  const idx = FIELD_CYCLE.indexOf(state.activeField);
  const next = FIELD_CYCLE[(idx + 1) % FIELD_CYCLE.length];
  return { ...state, activeField: next };
}

export function deactivateFilterBar(state: FilterBarState): FilterBarState {
  return { ...state, activeField: null };
}

export function setFilterValue(
  state: FilterBarState,
  value: string
): FilterBarState {
  if (!state.activeField) return state;
  return applyFilterBarInput(state, state.activeField, value);
}

export function handleFilterKey(
  state: FilterBarState,
  key: string
): { state: FilterBarState; consumed: boolean } {
  switch (key) {
    case 'f':
      return { state: cycleActiveField(state), consumed: true };
    case 'escape':
      return { state: deactivateFilterBar(state), consumed: true };
    case 'F': // shift-F clears all filters
      return { state: clearFilterBar(createFilterBarState()), consumed: true };
    default:
      return { state, consumed: false };
  }
}

export function getFilterSummary(state: FilterBarState): string {
  const active: string[] = [];
  if (state.status) active.push(`status=${state.status}`);
  if (state.host) active.push(`host=${state.host}`);
  if (state.tag) active.push(`tag=${state.tag}`);
  return active.length > 0 ? `Filters: ${active.join(', ')}` : 'No active filters';
}
