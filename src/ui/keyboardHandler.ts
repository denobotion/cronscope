import { CronJob } from '../types/cronJob';
import { renderDetailPanel } from './detailPanel';

export type KeyAction = 'up' | 'down' | 'select' | 'quit' | 'refresh' | 'unknown';

export interface DashboardState {
  selectedIndex: number;
  jobs: CronJob[];
  showDetail: boolean;
}

export function parseKeyInput(key: Buffer): KeyAction {
  const str = key.toString();
  if (str === '\u001B[A' || str === 'k') return 'up';
  if (str === '\u001B[B' || str === 'j') return 'down';
  if (str === '\r' || str === ' ') return 'select';
  if (str === 'q' || str === '\u0003') return 'quit';
  if (str === 'r') return 'refresh';
  return 'unknown';
}

export function applyKeyAction(
  state: DashboardState,
  action: KeyAction
): DashboardState {
  switch (action) {
    case 'up':
      return {
        ...state,
        selectedIndex: Math.max(0, state.selectedIndex - 1),
        showDetail: false,
      };
    case 'down':
      return {
        ...state,
        selectedIndex: Math.min(state.jobs.length - 1, state.selectedIndex + 1),
        showDetail: false,
      };
    case 'select':
      return { ...state, showDetail: !state.showDetail };
    case 'refresh':
      return { ...state, showDetail: false };
    default:
      return state;
  }
}

export function renderDetailOrHint(state: DashboardState): string {
  if (state.showDetail && state.jobs[state.selectedIndex]) {
    return renderDetailPanel(state.jobs[state.selectedIndex]);
  }
  return '  [↑/↓] Navigate   [Enter] Detail   [r] Refresh   [q] Quit';
}
