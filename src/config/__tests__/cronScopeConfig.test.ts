import {
  DEFAULT_CONFIG,
  mergeConfig,
  validateConfig,
  CronScopeConfig,
} from '../cronScopeConfig';

describe('DEFAULT_CONFIG', () => {
  it('has expected default values', () => {
    expect(DEFAULT_CONFIG.refreshIntervalSeconds).toBe(30);
    expect(DEFAULT_CONFIG.maxNextRuns).toBe(5);
    expect(DEFAULT_CONFIG.defaultExportFormat).toBe('json');
    expect(DEFAULT_CONFIG.healthCheckEnabled).toBe(true);
    expect(DEFAULT_CONFIG.theme).toBe('dark');
    expect(DEFAULT_CONFIG.remoteHosts).toEqual([]);
  });
});

describe('mergeConfig', () => {
  it('overrides specified fields', () => {
    const merged = mergeConfig(DEFAULT_CONFIG, { theme: 'light', maxNextRuns: 10 });
    expect(merged.theme).toBe('light');
    expect(merged.maxNextRuns).toBe(10);
    expect(merged.refreshIntervalSeconds).toBe(DEFAULT_CONFIG.refreshIntervalSeconds);
  });

  it('does not mutate base config', () => {
    mergeConfig(DEFAULT_CONFIG, { theme: 'light' });
    expect(DEFAULT_CONFIG.theme).toBe('dark');
  });
});

describe('validateConfig', () => {
  const valid: CronScopeConfig = { ...DEFAULT_CONFIG };

  it('returns no errors for valid config', () => {
    expect(validateConfig(valid)).toEqual([]);
  });

  it('errors when refreshIntervalSeconds < 5', () => {
    const errors = validateConfig({ ...valid, refreshIntervalSeconds: 3 });
    expect(errors.some(e => e.includes('refreshIntervalSeconds'))).toBe(true);
  });

  it('errors when maxNextRuns is 0', () => {
    const errors = validateConfig({ ...valid, maxNextRuns: 0 });
    expect(errors.some(e => e.includes('maxNextRuns'))).toBe(true);
  });

  it('errors when maxNextRuns exceeds 20', () => {
    const errors = validateConfig({ ...valid, maxNextRuns: 21 });
    expect(errors.some(e => e.includes('maxNextRuns'))).toBe(true);
  });

  it('errors when staleThresholdMinutes < 1', () => {
    const errors = validateConfig({ ...valid, staleThresholdMinutes: 0 });
    expect(errors.some(e => e.includes('staleThresholdMinutes'))).toBe(true);
  });

  it('errors for remote host missing alias', () => {
    const errors = validateConfig({
      ...valid,
      remoteHosts: [{ alias: '', host: 'example.com' }],
    });
    expect(errors.some(e => e.includes('alias or host'))).toBe(true);
  });

  it('accepts valid remote host entries', () => {
    const errors = validateConfig({
      ...valid,
      remoteHosts: [{ alias: 'prod', host: '10.0.0.1', user: 'deploy', port: 22 }],
    });
    expect(errors).toEqual([]);
  });
});
