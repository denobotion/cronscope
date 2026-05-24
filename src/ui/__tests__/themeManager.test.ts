import {
  getTheme,
  listThemes,
  applyThemeColor,
  isValidTheme,
  ThemeName,
} from '../themeManager';
import { resolveThemeConfig, renderThemeConfigSummary } from '../../config/themeConfig';

describe('getTheme', () => {
  it('returns the default theme', () => {
    const theme = getTheme('default');
    expect(theme.name).toBe('default');
    expect(theme.successColor).toContain('\x1b[');
  });

  it('returns the dark theme', () => {
    const theme = getTheme('dark');
    expect(theme.name).toBe('dark');
  });

  it('falls back to default for unknown theme name', () => {
    const theme = getTheme('unknown' as ThemeName);
    expect(theme.name).toBe('default');
  });
});

describe('listThemes', () => {
  it('includes all expected themes', () => {
    const themes = listThemes();
    expect(themes).toContain('default');
    expect(themes).toContain('dark');
    expect(themes).toContain('light');
    expect(themes).toContain('solarized');
  });
});

describe('applyThemeColor', () => {
  it('wraps text with color and reset', () => {
    const result = applyThemeColor('\x1b[32m', 'hello');
    expect(result).toBe('\x1b[32mhello\x1b[0m');
  });
});

describe('isValidTheme', () => {
  it('returns true for valid theme names', () => {
    expect(isValidTheme('dark')).toBe(true);
    expect(isValidTheme('solarized')).toBe(true);
  });

  it('returns false for invalid theme names', () => {
    expect(isValidTheme('neon')).toBe(false);
    expect(isValidTheme('')).toBe(false);
  });
});

describe('resolveThemeConfig', () => {
  it('uses defaults when no overrides provided', () => {
    const config = resolveThemeConfig({}, {});
    expect(config.theme).toBe('default');
    expect(config.noColor).toBe(false);
  });

  it('respects CRONSCOPE_THEME env variable', () => {
    const config = resolveThemeConfig({}, { CRONSCOPE_THEME: 'dark' });
    expect(config.theme).toBe('dark');
  });

  it('partial config overrides env', () => {
    const config = resolveThemeConfig({ theme: 'light' }, { CRONSCOPE_THEME: 'dark' });
    expect(config.theme).toBe('light');
  });

  it('sets noColor when NO_COLOR env is present', () => {
    const config = resolveThemeConfig({}, { NO_COLOR: '1' });
    expect(config.noColor).toBe(true);
  });

  it('ignores invalid theme names from env', () => {
    const config = resolveThemeConfig({}, { CRONSCOPE_THEME: 'invalid' });
    expect(config.theme).toBe('default');
  });
});

describe('renderThemeConfigSummary', () => {
  it('renders theme and noColor fields', () => {
    const summary = renderThemeConfigSummary({ theme: 'solarized', noColor: false });
    expect(summary).toContain('solarized');
    expect(summary).toContain('No Color');
  });
});
