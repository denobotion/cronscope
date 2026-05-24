import { CronJob } from '../types/cronJob';
import { HealthWarning } from '../scheduler/cronHealthChecker';

export type BannerLevel = 'info' | 'warn' | 'error';

export interface Banner {
  message: string;
  level: BannerLevel;
  expiresAt: number;
}

const LEVEL_COLORS: Record<BannerLevel, string> = {
  info: '\x1b[44m\x1b[97m',
  warn: '\x1b[43m\x1b[30m',
  error: '\x1b[41m\x1b[97m',
};

const RESET = '\x1b[0m';

export function createBanner(
  message: string,
  level: BannerLevel = 'info',
  ttlMs: number = 5000
): Banner {
  return {
    message,
    level,
    expiresAt: Date.now() + ttlMs,
  };
}

export function isBannerExpired(banner: Banner): boolean {
  return Date.now() > banner.expiresAt;
}

export function renderBanner(banner: Banner, width: number = 80): string {
  if (isBannerExpired(banner)) return '';
  const color = LEVEL_COLORS[banner.level];
  const label = banner.level.toUpperCase().padEnd(5);
  const text = ` [${label}] ${banner.message}`;
  const padded = text.padEnd(width).slice(0, width);
  return `${color}${padded}${RESET}`;
}

export function bannersFromWarnings(
  warnings: HealthWarning[],
  ttlMs: number = 8000
): Banner[] {
  return warnings.map((w) => {
    const level: BannerLevel = w.severity === 'critical' ? 'error' : 'warn';
    return createBanner(`${w.jobName}: ${w.message}`, level, ttlMs);
  });
}

export function getActiveBanners(banners: Banner[]): Banner[] {
  return banners.filter((b) => !isBannerExpired(b));
}
