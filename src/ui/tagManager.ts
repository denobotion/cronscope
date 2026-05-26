import { CronJob } from '../types/cronJob';

export interface TagManagerState {
  tags: Record<string, string[]>; // jobKey -> tags
  allTags: Set<string>;
  activeFilter: string | null;
}

export function jobKey(job: CronJob): string {
  return `${job.host ?? 'local'}:${job.schedule}:${job.command}`;
}

export function createTagManagerState(): TagManagerState {
  return { tags: {}, allTags: new Set(), activeFilter: null };
}

export function addTag(state: TagManagerState, job: CronJob, tag: string): TagManagerState {
  const key = jobKey(job);
  const existing = state.tags[key] ?? [];
  if (existing.includes(tag)) return state;
  const updated = { ...state.tags, [key]: [...existing, tag] };
  const allTags = new Set(state.allTags);
  allTags.add(tag);
  return { ...state, tags: updated, allTags };
}

export function removeTag(state: TagManagerState, job: CronJob, tag: string): TagManagerState {
  const key = jobKey(job);
  const existing = state.tags[key] ?? [];
  const updated = { ...state.tags, [key]: existing.filter(t => t !== tag) };
  const allTags = new Set<string>();
  Object.values(updated).forEach(tags => tags.forEach(t => allTags.add(t)));
  return { ...state, tags: updated, allTags };
}

export function getTagsForJob(state: TagManagerState, job: CronJob): string[] {
  return state.tags[jobKey(job)] ?? [];
}

export function setActiveTagFilter(state: TagManagerState, tag: string | null): TagManagerState {
  return { ...state, activeFilter: tag };
}

export function applyTagFilter(state: TagManagerState, jobs: CronJob[]): CronJob[] {
  if (!state.activeFilter) return jobs;
  const filter = state.activeFilter;
  return jobs.filter(job => getTagsForJob(state, job).includes(filter));
}

export function renderTagList(tags: string[]): string {
  if (tags.length === 0) return '(no tags)';
  return tags.map(t => `[${t}]`).join(' ');
}
