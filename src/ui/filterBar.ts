import { FilterState, CronJob } from '../types/cronJob';

export interface FilterBarState {
  status: string | null;
  host: string | null;
  tag: string | null;
  activeField: 'status' | 'host' | 'tag' | null;
}

export function createFilterBarState(): FilterBarState {
  return { status: null, host: null, tag: null, activeField: null };
}

export function applyFilterBarInput(
  state: FilterBarState,
  field: 'status' | 'host' | 'tag',
  value: string | null
): FilterBarState {
  return { ...state, [field]: value || null };
}

export function clearFilterBar(state: FilterBarState): FilterBarState {
  return { status: null, host: null, tag: null, activeField: null };
}

export function matchesFilterBar(job: CronJob, state: FilterBarState): boolean {
  if (state.status && job.status !== state.status) return false;
  if (state.host && job.host !== state.host) return false;
  if (state.tag && !(job.tags ?? []).includes(state.tag)) return false;
  return true;
}

export function applyFilterBarToJobs(jobs: CronJob[], state: FilterBarState): CronJob[] {
  return jobs.filter(job => matchesFilterBar(job, state));
}

export function renderFilterBar(state: FilterBarState, terminalWidth = 80): string {
  const parts: string[] = [];
  const label = (name: string, val: string | null, active: boolean) => {
    const display = val ? `\x1b[32m${val}\x1b[0m` : '\x1b[90m(any)\x1b[0m';
    const prefix = active ? '\x1b[1m>' : ' ';
    return `${prefix} ${name}: ${display}\x1b[0m`;
  };
  parts.push(label('Status', state.status, state.activeField === 'status'));
  parts.push(label('Host', state.host, state.activeField === 'host'));
  parts.push(label('Tag', state.tag, state.activeField === 'tag'));
  const line = '  ' + parts.join('  |  ');
  return `\x1b[4mFilters\x1b[0m\n${line}`;
}
