export type ThemeName = 'default' | 'dark' | 'light' | 'solarized';

export interface Theme {
  name: ThemeName;
  headerFg: string;
  headerBg: string;
  rowFg: string;
  altRowFg: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  mutedColor: string;
  borderColor: string;
  titleColor: string;
}

const themes: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    headerFg: '\x1b[1;37m',
    headerBg: '\x1b[44m',
    rowFg: '\x1b[0m',
    altRowFg: '\x1b[2m',
    successColor: '\x1b[32m',
    warningColor: '\x1b[33m',
    errorColor: '\x1b[31m',
    mutedColor: '\x1b[90m',
    borderColor: '\x1b[36m',
    titleColor: '\x1b[1;36m',
  },
  dark: {
    name: 'dark',
    headerFg: '\x1b[1;97m',
    headerBg: '\x1b[40m',
    rowFg: '\x1b[97m',
    altRowFg: '\x1b[37m',
    successColor: '\x1b[92m',
    warningColor: '\x1b[93m',
    errorColor: '\x1b[91m',
    mutedColor: '\x1b[90m',
    borderColor: '\x1b[96m',
    titleColor: '\x1b[1;96m',
  },
  light: {
    name: 'light',
    headerFg: '\x1b[1;30m',
    headerBg: '\x1b[47m',
    rowFg: '\x1b[30m',
    altRowFg: '\x1b[2;30m',
    successColor: '\x1b[32m',
    warningColor: '\x1b[33m',
    errorColor: '\x1b[31m',
    mutedColor: '\x1b[2;30m',
    borderColor: '\x1b[34m',
    titleColor: '\x1b[1;34m',
  },
  solarized: {
    name: 'solarized',
    headerFg: '\x1b[1;33m',
    headerBg: '\x1b[44m',
    rowFg: '\x1b[0m',
    altRowFg: '\x1b[2m',
    successColor: '\x1b[32m',
    warningColor: '\x1b[35m',
    errorColor: '\x1b[31m',
    mutedColor: '\x1b[90m',
    borderColor: '\x1b[33m',
    titleColor: '\x1b[1;33m',
  },
};

export function getTheme(name: ThemeName): Theme {
  return themes[name] ?? themes['default'];
}

export function listThemes(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

export function applyThemeColor(color: string, text: string): string {
  return `${color}${text}\x1b[0m`;
}

export function isValidTheme(name: string): name is ThemeName {
  return Object.keys(themes).includes(name);
}
