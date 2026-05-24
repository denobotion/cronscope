import { ThemeName, isValidTheme } from '../ui/themeManager';

export interface ThemeConfig {
  theme: ThemeName;
  noColor: boolean;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  theme: 'default',
  noColor: false,
};

export function resolveThemeConfig(
  partial: Partial<ThemeConfig>,
  env: Record<string, string | undefined> = process.env
): ThemeConfig {
  const noColor = !!(env['NO_COLOR'] || env['CRONSCOPE_NO_COLOR'] || partial.noColor);

  let theme: ThemeName = DEFAULT_THEME_CONFIG.theme;
  const envTheme = env['CRONSCOPE_THEME'];
  if (envTheme && isValidTheme(envTheme)) {
    theme = envTheme;
  }
  if (partial.theme && isValidTheme(partial.theme)) {
    theme = partial.theme;
  }

  return { theme, noColor };
}

export function renderThemeConfigSummary(config: ThemeConfig): string {
  const lines: string[] = [
    `Theme     : ${config.theme}`,
    `No Color  : ${config.noColor}`,
  ];
  return lines.join('\n');
}
