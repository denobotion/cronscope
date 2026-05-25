import {
  ColumnManagerState,
  ColumnId,
  toggleColumn,
  resizeColumn,
} from './columnManager';

const COLUMN_ORDER: ColumnId[] = [
  'host', 'user', 'schedule', 'command', 'status', 'nextRun', 'interval',
];

export type ColumnAction =
  | { type: 'toggle'; id: ColumnId }
  | { type: 'widen'; id: ColumnId }
  | { type: 'narrow'; id: ColumnId }
  | { type: 'none' };

export function parseColumnKey(key: string): ColumnAction {
  // Number keys 1-7 toggle the corresponding column
  const num = parseInt(key, 10);
  if (!isNaN(num) && num >= 1 && num <= COLUMN_ORDER.length) {
    return { type: 'toggle', id: COLUMN_ORDER[num - 1] };
  }
  return { type: 'none' };
}

export function applyColumnAction(
  state: ColumnManagerState,
  action: ColumnAction
): ColumnManagerState {
  switch (action.type) {
    case 'toggle':
      return toggleColumn(state, action.id);
    case 'widen':
      return resizeColumn(state, action.id, 2);
    case 'narrow':
      return resizeColumn(state, action.id, -2);
    default:
      return state;
  }
}

export function handleColumnKey(
  state: ColumnManagerState,
  key: string
): ColumnManagerState {
  const action = parseColumnKey(key);
  return applyColumnAction(state, action);
}

export function getColumnSummary(state: ColumnManagerState): string {
  const visible = state.columns.filter(c => c.visible).map(c => c.label);
  return `Columns: ${visible.join(' | ')}`;
}
