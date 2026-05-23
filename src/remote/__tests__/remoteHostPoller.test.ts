import {
  createPollerState,
  pollAllHosts,
  startPoller,
  stopPoller,
  getAllJobsFromState,
  PollResult,
} from '../remoteHostPoller';
import * as poller from '../remoteHostPoller';
import { RemoteHostConfig } from '../remoteHostConfig';

const mockHost: RemoteHostConfig = {
  host: '10.0.0.1',
  user: 'deploy',
  alias: 'prod-1',
};

const mockJob = {
  id: 'abc',
  schedule: '*/5 * * * *',
  command: 'echo hi',
  host: 'prod-1',
  source: 'remote',
  enabled: true,
  rawLine: '*/5 * * * * echo hi',
};

describe('createPollerState', () => {
  it('initializes with empty results and no timer', () => {
    const state = createPollerState(30000);
    expect(state.results.size).toBe(0);
    expect(state.timer).toBeNull();
    expect(state.intervalMs).toBe(30000);
  });

  it('defaults to 60000ms interval', () => {
    const state = createPollerState();
    expect(state.intervalMs).toBe(60000);
  });
});

describe('pollAllHosts', () => {
  it('returns a PollResult per host', () => {
    jest.spyOn(poller, 'pollHost').mockImplementation((h) => ({
      host: h.alias ?? h.host,
      jobs: [mockJob as any],
      polledAt: new Date(),
    }));
    const results = pollAllHosts([mockHost]);
    expect(results).toHaveLength(1);
    expect(results[0].host).toBe('prod-1');
    expect(results[0].jobs).toHaveLength(1);
  });

  it('captures errors from individual hosts', () => {
    jest.spyOn(poller, 'pollHost').mockImplementation((h) => ({
      host: h.alias ?? h.host,
      jobs: [],
      error: 'Connection refused',
      polledAt: new Date(),
    }));
    const results = pollAllHosts([mockHost]);
    expect(results[0].error).toBe('Connection refused');
    expect(results[0].jobs).toHaveLength(0);
  });
});

describe('startPoller / stopPoller', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls onUpdate immediately and on interval', () => {
    jest.spyOn(poller, 'pollHost').mockReturnValue({
      host: 'prod-1',
      jobs: [],
      polledAt: new Date(),
    });
    const onUpdate = jest.fn();
    let state = createPollerState(5000);
    state = startPoller(state, [mockHost], onUpdate);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(10000);
    expect(onUpdate).toHaveBeenCalledTimes(3);
    stopPoller(state);
  });

  it('stopPoller clears timer', () => {
    jest.spyOn(poller, 'pollHost').mockReturnValue({
      host: 'prod-1',
      jobs: [],
      polledAt: new Date(),
    });
    let state = createPollerState(5000);
    state = startPoller(state, [mockHost], jest.fn());
    const stopped = stopPoller(state);
    expect(stopped.timer).toBeNull();
  });
});

describe('getAllJobsFromState', () => {
  it('flattens jobs from all hosts in state', () => {
    const state = createPollerState();
    state.results.set('prod-1', {
      host: 'prod-1',
      jobs: [mockJob as any],
      polledAt: new Date(),
    });
    const jobs = getAllJobsFromState(state);
    expect(jobs.length).toBeGreaterThanOrEqual(1);
  });
});
