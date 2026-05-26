import {
  createTagManagerState,
  addTag,
  removeTag,
  getTagsForJob,
  setActiveTagFilter,
  applyTagFilter,
  renderTagList,
  jobKey,
} from '../tagManager';
import { CronJob } from '../../types/cronJob';

function makeJob(command: string, host?: string): CronJob {
  return {
    schedule: '* * * * *',
    command,
    host: host ?? 'local',
    enabled: true,
    raw: `* * * * * ${command}`,
  } as CronJob;
}

describe('tagManager', () => {
  it('creates empty state', () => {
    const state = createTagManagerState();
    expect(state.tags).toEqual({});
    expect(state.allTags.size).toBe(0);
    expect(state.activeFilter).toBeNull();
  });

  it('adds a tag to a job', () => {
    const job = makeJob('backup.sh');
    let state = createTagManagerState();
    state = addTag(state, job, 'critical');
    expect(getTagsForJob(state, job)).toContain('critical');
    expect(state.allTags.has('critical')).toBe(true);
  });

  it('does not duplicate tags', () => {
    const job = makeJob('backup.sh');
    let state = createTagManagerState();
    state = addTag(state, job, 'critical');
    state = addTag(state, job, 'critical');
    expect(getTagsForJob(state, job)).toHaveLength(1);
  });

  it('removes a tag from a job', () => {
    const job = makeJob('backup.sh');
    let state = createTagManagerState();
    state = addTag(state, job, 'critical');
    state = removeTag(state, job, 'critical');
    expect(getTagsForJob(state, job)).not.toContain('critical');
    expect(state.allTags.has('critical')).toBe(false);
  });

  it('filters jobs by active tag', () => {
    const job1 = makeJob('backup.sh');
    const job2 = makeJob('cleanup.sh');
    let state = createTagManagerState();
    state = addTag(state, job1, 'critical');
    state = setActiveTagFilter(state, 'critical');
    const result = applyTagFilter(state, [job1, job2]);
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe('backup.sh');
  });

  it('returns all jobs when no filter active', () => {
    const job1 = makeJob('a.sh');
    const job2 = makeJob('b.sh');
    const state = createTagManagerState();
    expect(applyTagFilter(state, [job1, job2])).toHaveLength(2);
  });

  it('renders tag list correctly', () => {
    expect(renderTagList(['critical', 'nightly'])).toBe('[critical] [nightly]');
    expect(renderTagList([])).toBe('(no tags)');
  });

  it('generates consistent job keys', () => {
    const job = makeJob('test.sh', 'host1');
    expect(jobKey(job)).toBe('host1:* * * * *:test.sh');
  });
});
