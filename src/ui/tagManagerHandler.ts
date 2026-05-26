import { TagManagerState, addTag, removeTag, setActiveTagFilter, createTagManagerState } from './tagManager';
import { CronJob } from '../types/cronJob';

export type TagAction =
  | { type: 'add'; tag: string }
  | { type: 'remove'; tag: string }
  | { type: 'filter'; tag: string | null }
  | { type: 'clear' };

export function parseTagAction(input: string, currentTags: string[]): TagAction | null {
  const trimmed = input.trim();
  if (trimmed.startsWith('+') && trimmed.length > 1) {
    return { type: 'add', tag: trimmed.slice(1).trim() };
  }
  if (trimmed.startsWith('-') && trimmed.length > 1) {
    return { type: 'remove', tag: trimmed.slice(1).trim() };
  }
  if (trimmed.startsWith('/') && trimmed.length > 1) {
    return { type: 'filter', tag: trimmed.slice(1).trim() };
  }
  if (trimmed === '/') {
    return { type: 'filter', tag: null };
  }
  if (trimmed === 'clear') {
    return { type: 'clear' };
  }
  return null;
}

export function applyTagAction(
  state: TagManagerState,
  job: CronJob,
  action: TagAction
): TagManagerState {
  switch (action.type) {
    case 'add':
      return addTag(state, job, action.tag);
    case 'remove':
      return removeTag(state, job, action.tag);
    case 'filter':
      return setActiveTagFilter(state, action.tag);
    case 'clear':
      return createTagManagerState();
    default:
      return state;
  }
}

export function getTagSummary(state: TagManagerState): string {
  const total = Object.values(state.tags).reduce((acc, t) => acc + t.length, 0);
  const unique = state.allTags.size;
  const filter = state.activeFilter ? ` | filter: [${state.activeFilter}]` : '';
  return `Tags: ${total} applied, ${unique} unique${filter}`;
}
