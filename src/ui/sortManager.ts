import { CronJob } from '../types/cronJob';

export type SortField = 'name' | 'schedule' | 'nextRun' | 'status' | 'host';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortField;
  direction: SortDirection;
}

export function createSortState(field: SortField = 'name', direction: SortDirection = 'asc'): SortState {
  return { field, direction };
}

export function toggleSortDirection(state: SortState): SortState {
  return { ...state, direction: state.direction === 'asc' ? 'desc' : 'asc' };
}

export function setSortField(state: SortState, field: SortField): SortState {
  if (state.field === field) {
    return toggleSortDirection(state);
  }
  return { field, direction: 'asc' };
}

export function applySortToJobs(jobs: CronJob[], state: SortState): CronJob[] {
  const sorted = [...jobs].sort((a, b) => {
    let valA: string | number | undefined;
    let valB: string | number | undefined;

    switch (state.field) {
      case 'name':
        valA = a.name ?? a.command;
        valB = b.name ?? b.command;
        break;
      case 'schedule':
        valA = a.schedule;
        valB = b.schedule;
        break;
      case 'nextRun':
        valA = a.nextRun ? new Date(a.nextRun).getTime() : Infinity;
        valB = b.nextRun ? new Date(b.nextRun).getTime() : Infinity;
        break;
      case 'status':
        valA = a.status ?? '';
        valB = b.status ?? '';
        break;
      case 'host':
        valA = a.host ?? '';
        valB = b.host ?? '';
        break;
      default:
        return 0;
    }

    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
    return state.direction === 'asc' ? cmp : -cmp;
  });

  return sorted;
}

export function renderSortIndicator(state: SortState, field: SortField): string {
  if (state.field !== field) return '  ';
  return state.direction === 'asc' ? ' ▲' : ' ▼';
}
