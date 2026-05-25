export type ColumnId = 'host' | 'user' | 'schedule' | 'command' | 'status' | 'nextRun' | 'interval';

export interface ColumnDef {
  id: ColumnId;
  label: string;
  width: number;
  visible: boolean;
  minWidth: number;
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'host',     label: 'HOST',     width: 14, visible: true,  minWidth: 6  },
  { id: 'user',     label: 'USER',     width: 10, visible: true,  minWidth: 5  },
  { id: 'schedule', label: 'SCHEDULE', width: 18, visible: true,  minWidth: 10 },
  { id: 'command',  label: 'COMMAND',  width: 28, visible: true,  minWidth: 10 },
  { id: 'status',   label: 'STATUS',   width: 10, visible: true,  minWidth: 6  },
  { id: 'nextRun',  label: 'NEXT RUN', width: 20, visible: true,  minWidth: 10 },
  { id: 'interval', label: 'INTERVAL', width: 10, visible: false, minWidth: 6  },
];

export interface ColumnManagerState {
  columns: ColumnDef[];
}

export function createColumnManagerState(): ColumnManagerState {
  return { columns: DEFAULT_COLUMNS.map(c => ({ ...c })) };
}

export function toggleColumn(state: ColumnManagerState, id: ColumnId): ColumnManagerState {
  return {
    columns: state.columns.map(c =>
      c.id === id ? { ...c, visible: !c.visible } : c
    ),
  };
}

export function resizeColumn(state: ColumnManagerState, id: ColumnId, delta: number): ColumnManagerState {
  return {
    columns: state.columns.map(c =>
      c.id === id ? { ...c, width: Math.max(c.minWidth, c.width + delta) } : c
    ),
  };
}

export function getVisibleColumns(state: ColumnManagerState): ColumnDef[] {
  return state.columns.filter(c => c.visible);
}

export function renderColumnToggleMenu(state: ColumnManagerState): string {
  const lines = ['  COLUMNS (toggle with number key):', ''];
  state.columns.forEach((col, i) => {
    const check = col.visible ? '[x]' : '[ ]';
    lines.push(`  ${i + 1}. ${check} ${col.label}`);
  });
  return lines.join('\n');
}
