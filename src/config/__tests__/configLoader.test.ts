import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, findConfigFile, loadConfigFromFile } from '../configLoader';
import { DEFAULT_CONFIG } from '../cronScopeConfig';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('findConfigFile', () => {
  it('returns null when no config file exists', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const result = findConfigFile('/some/dir');
    expect(result).toBeNull();
  });

  it('returns path when .cronscope.json exists', () => {
    mockedFs.existsSync.mockImplementation((p) =>
      (p as string).endsWith('.cronscope.json')
    );
    const result = findConfigFile('/some/dir');
    expect(result).toBe(path.join('/some/dir', '.cronscope.json'));
  });
});

describe('loadConfigFromFile', () => {
  it('parses JSON from file', () => {
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ theme: 'light', maxNextRuns: 8 })
    );
    const partial = loadConfigFromFile('/fake/path/.cronscope.json');
    expect(partial.theme).toBe('light');
    expect(partial.maxNextRuns).toBe(8);
  });
});

describe('loadConfig', () => {
  it('returns defaults when no config file found', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const { config, errors, source } = loadConfig();
    expect(source).toBe('defaults');
    expect(errors).toEqual([]);
    expect(config.refreshIntervalSeconds).toBe(DEFAULT_CONFIG.refreshIntervalSeconds);
  });

  it('merges file config with defaults', () => {
    mockedFs.existsSync.mockImplementation((p) =>
      (p as string).endsWith('.cronscope.json')
    );
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ theme: 'light' })
    );
    const { config, errors } = loadConfig();
    expect(config.theme).toBe('light');
    expect(config.maxNextRuns).toBe(DEFAULT_CONFIG.maxNextRuns);
    expect(errors).toEqual([]);
  });

  it('applies overrides on top of file config', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const { config } = loadConfig({ maxNextRuns: 3 });
    expect(config.maxNextRuns).toBe(3);
  });

  it('returns validation errors for invalid config', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const { errors } = loadConfig({ refreshIntervalSeconds: 1 });
    expect(errors.length).toBeGreaterThan(0);
  });
});
