import { parseTagAction, applyTagAction, getTagSummary } from '../tagManagerHandler';
import { createTagManagerState, addTag } from '../tagManager';
import { CronJob } from '../../types/cronJob';

function makeJob(command: string): CronJob {
  return {
    schedule: '0 * * * *',
    command,
    host: 'local',
    enabled: true,
    raw: `0 * * * * ${command}`,
  } as CronJob;
}

describe('tagManagerHandler', () => {
  describe('parseTagAction', () => {
    it('parses add action', () => {
      expect(parseTagAction('+critical', [])).toEqual({ type: 'add', tag: 'critical' });
    });

    it('parses remove action', () => {
      expect(parseTagAction('-critical', ['critical'])).toEqual({ type: 'remove', tag: 'critical' });
    });

    it('parses filter action with tag', () => {
      expect(parseTagAction('/nightly', [])).toEqual({ type: 'filter', tag: 'nightly' });
    });

    it('parses filter clear with bare slash', () => {
      expect(parseTagAction('/', [])).toEqual({ type: 'filter', tag: null });
    });

    it('parses clear action', () => {
      expect(parseTagAction('clear', [])).toEqual({ type: 'clear' });
    });

    it('returns null for unknown input', () => {
      expect(parseTagAction('unknown', [])).toBeNull();
    });
  });

  describe('applyTagAction', () => {
    it('adds a tag via action', () => {
      const job = makeJob('sync.sh');
      const state = createTagManagerState();
      const next = applyTagAction(state, job, { type: 'add', tag: 'infra' });
      expect(next.allTags.has('infra')).toBe(true);
    });

    it('removes a tag via action', () => {
      const job = makeJob('sync.sh');
      let state = createTagManagerState();
      state = addTag(state, job, 'infra');
      const next = applyTagAction(state, job, { type: 'remove', tag: 'infra' });
      expect(next.allTags.has('infra')).toBe(false);
    });

    it('sets filter via action', () => {
      const state = createTagManagerState();
      const next = applyTagAction(state, makeJob('x.sh'), { type: 'filter', tag: 'prod' });
      expect(next.activeFilter).toBe('prod');
    });

    it('clears all state via clear action', () => {
      const job = makeJob('sync.sh');
      let state = createTagManagerState();
      state = addTag(state, job, 'infra');
      const next = applyTagAction(state, job, { type: 'clear' });
      expect(next.allTags.size).toBe(0);
    });
  });

  describe('getTagSummary', () => {
    it('returns summary with counts', () => {
      const job = makeJob('a.sh');
      let state = createTagManagerState();
      state = addTag(state, job, 'prod');
      state = addTag(state, job, 'nightly');
      const summary = getTagSummary(state);
      expect(summary).toContain('2 applied');
      expect(summary).toContain('2 unique');
    });

    it('includes active filter in summary', () => {
      let state = createTagManagerState();
      state = { ...state, activeFilter: 'prod' };
      expect(getTagSummary(state)).toContain('filter: [prod]');
    });
  });
});
