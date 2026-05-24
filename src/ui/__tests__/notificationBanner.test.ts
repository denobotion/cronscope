import {
  createBanner,
  isBannerExpired,
  renderBanner,
  bannersFromWarnings,
  getActiveBanners,
  Banner,
} from '../notificationBanner';
import { HealthWarning } from '../../scheduler/cronHealthChecker';

describe('createBanner', () => {
  it('creates a banner with default level info', () => {
    const b = createBanner('hello');
    expect(b.message).toBe('hello');
    expect(b.level).toBe('info');
    expect(b.expiresAt).toBeGreaterThan(Date.now());
  });

  it('creates a banner with specified level and ttl', () => {
    const before = Date.now();
    const b = createBanner('alert', 'error', 1000);
    expect(b.level).toBe('error');
    expect(b.expiresAt).toBeGreaterThanOrEqual(before + 1000);
  });
});

describe('isBannerExpired', () => {
  it('returns false for a future banner', () => {
    const b = createBanner('msg', 'info', 5000);
    expect(isBannerExpired(b)).toBe(false);
  });

  it('returns true for an already expired banner', () => {
    const b: Banner = { message: 'old', level: 'warn', expiresAt: Date.now() - 1 };
    expect(isBannerExpired(b)).toBe(true);
  });
});

describe('renderBanner', () => {
  it('returns empty string for expired banner', () => {
    const b: Banner = { message: 'gone', level: 'info', expiresAt: Date.now() - 1 };
    expect(renderBanner(b)).toBe('');
  });

  it('renders banner with ANSI color codes', () => {
    const b = createBanner('test message', 'warn', 5000);
    const rendered = renderBanner(b, 80);
    expect(rendered).toContain('WARN');
    expect(rendered).toContain('test message');
    expect(rendered).toContain('\x1b[');
  });

  it('truncates message to specified width', () => {
    const b = createBanner('x'.repeat(200), 'info', 5000);
    const rendered = renderBanner(b, 40);
    // strip ansi for length check
    const stripped = rendered.replace(/\x1b\[[^m]*m/g, '');
    expect(stripped.length).toBe(40);
  });
});

describe('bannersFromWarnings', () => {
  const warnings: HealthWarning[] = [
    { jobName: 'backup', message: 'overdue', severity: 'critical' },
    { jobName: 'sync', message: 'stale', severity: 'warning' },
  ];

  it('maps critical warnings to error banners', () => {
    const banners = bannersFromWarnings(warnings);
    expect(banners[0].level).toBe('error');
    expect(banners[0].message).toContain('backup');
  });

  it('maps non-critical warnings to warn banners', () => {
    const banners = bannersFromWarnings(warnings);
    expect(banners[1].level).toBe('warn');
    expect(banners[1].message).toContain('sync');
  });
});

describe('getActiveBanners', () => {
  it('filters out expired banners', () => {
    const active = createBanner('live', 'info', 5000);
    const expired: Banner = { message: 'dead', level: 'warn', expiresAt: Date.now() - 1 };
    const result = getActiveBanners([active, expired]);
    expect(result).toHaveLength(1);
    expect(result[0].message).toBe('live');
  });
});
