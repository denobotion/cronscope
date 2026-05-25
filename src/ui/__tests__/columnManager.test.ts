import {
  createColumnManagerState,
  toggleColumn,
  resizeColumn,
  getVisibleColumns,
  renderColumnToggleMenu,
} from '../columnManager';
import {
  parseColumnKey,
  applyColumnAction,
  handleColumnKey,
  getColumnSummary,
} from '../columnManagerHandler';

describe('createColumnManagerState', () => {
  it('returns default columns with correct visibility', () => {
    const state = createColumnManagerState();
    const visible = state.columns.filter(c => c.visible);
    expect(visible.length).toBeGreaterThan(0);
    const intervalCol = state.columns.find(c => c.id === 'interval');
    expect(intervalCol?.visible).toBe(false);
  });
});

describe('toggleColumn', () => {
  it('hides a visible column', () => {
    const state = createColumnManagerState();
    const next = toggleColumn(state, 'host');
    expect(next.columns.find(c => c.id === 'host')?.visible).toBe(false);
  });

  it('shows a hidden column', () => {
    const state = createColumnManagerState();
    const next = toggleColumn(state, 'interval');
    expect(next.columns.find(c => c.id === 'interval')?.visible).toBe(true);
  });

  it('does not mutate original state', () => {
    const state = createColumnManagerState();
    toggleColumn(state, 'host');
    expect(state.columns.find(c => c.id === 'host')?.visible).toBe(true);
  });
});

describe('resizeColumn', () => {
  it('increases column width by delta', () => {
    const state = createColumnManagerState();
    const orig = state.columns.find(c => c.id === 'command')!.width;
    const next = resizeColumn(state, 'command', 4);
    expect(next.columns.find(c => c.id === 'command')?.width).toBe(orig + 4);
  });

  it('does not shrink below minWidth', () => {
    const state = createColumnManagerState();
    const next = resizeColumn(state, 'host', -9999);
    const col = next.columns.find(c => c.id === 'host')!;
    expect(col.width).toBe(col.minWidth);
  });
});

describe('getVisibleColumns', () => {
  it('returns only visible columns', () => {
    const state = createColumnManagerState();
    const visible = getVisibleColumns(state);
    expect(visible.every(c => c.visible)).toBe(true);
  });
});

describe('renderColumnToggleMenu', () => {
  it('includes all column labels', () => {
    const state = createColumnManagerState();
    const output = renderColumnToggleMenu(state);
    expect(output).toContain('HOST');
    expect(output).toContain('SCHEDULE');
    expect(output).toContain('INTERVAL');
  });

  it('marks visible columns with [x]', () => {
    const state = createColumnManagerState();
    const output = renderColumnToggleMenu(state);
    expect(output).toContain('[x]');
  });
});

describe('parseColumnKey', () => {
  it('returns toggle action for valid number key', () => {
    const action = parseColumnKey('1');
    expect(action).toEqual({ type: 'toggle', id: 'host' });
  });

  it('returns none for out-of-range key', () => {
    expect(parseColumnKey('9')).toEqual({ type: 'none' });
  });

  it('returns none for non-numeric key', () => {
    expect(parseColumnKey('q')).toEqual({ type: 'none' });
  });
});

describe('handleColumnKey', () => {
  it('toggles column on number key press', () => {
    const state = createColumnManagerState();
    const next = handleColumnKey(state, '1');
    expect(next.columns.find(c => c.id === 'host')?.visible).toBe(false);
  });
});

describe('getColumnSummary', () => {
  it('lists visible column labels', () => {
    const state = createColumnManagerState();
    const summary = getColumnSummary(state);
    expect(summary).toContain('HOST');
    expect(summary).not.toContain('INTERVAL');
  });
});
