import { flattenFetchResults, FetchResult } from '../remoteCrontabFetcher';
import { RemoteHost } from '../remoteHostConfig';
import { CronJob } from '../../types/cronJob';

const makeHost = (id: string): RemoteHost => ({
  id,
  label: id,
  hostname: `${id}.example.com`,
  user: 'deploy',
  port: 22,
});

const makeJob = (id: string, hostId: string): CronJob => ({
  id,
  schedule: '0 * * * *',
  command: `echo ${id}`,
  source: hostId,
  enabled: true,
  rawLine: `0 * * * * echo ${id}`,
});

describe('flattenFetchResults', () => {
  it('returns empty array for empty results', () => {
    expect(flattenFetchResults([])).toEqual([]);
  });

  it('flattens jobs from multiple hosts', () => {
    const results: FetchResult[] = [
      { host: makeHost('host-a'), jobs: [makeJob('j1', 'host-a'), makeJob('j2', 'host-a')] },
      { host: makeHost('host-b'), jobs: [makeJob('j3', 'host-b')] },
    ];
    const flat = flattenFetchResults(results);
    expect(flat).toHaveLength(3);
    expect(flat.map((j) => j.id)).toEqual(['j1', 'j2', 'j3']);
  });

  it('skips hosts with errors and empty job arrays', () => {
    const results: FetchResult[] = [
      { host: makeHost('host-a'), jobs: [], error: 'Connection refused' },
      { host: makeHost('host-b'), jobs: [makeJob('j1', 'host-b')] },
    ];
    const flat = flattenFetchResults(results);
    expect(flat).toHaveLength(1);
    expect(flat[0].id).toBe('j1');
  });
});
