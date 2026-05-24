import { renderHelpOverlay, renderHelpRow, isHelpKey } from '../helpOverlay';

describe('isHelpKey', () => {
  it('returns true for h', () => {
    expect(isHelpKey('h')).toBe(true);
  });

  it('returns true for ?', () => {
    expect(isHelpKey('?')).toBe(true);
  });

  it('returns false for other keys', () => {
    expect(isHelpKey('q')).toBe(false);
    expect(isHelpKey('/')).toBe(false);
    expect(isHelpKey('')).toBe(false);
  });
});

describe('renderHelpRow', () => {
  it('formats key and description within given width', () => {
    const row = renderHelpRow('Enter', 'View job details', 60);
    expect(row).toContain('Enter');
    expect(row).toContain('View job details');
    expect(row.startsWith('│')).toBe(true);
    expect(row.endsWith('│')).toBe(true);
  });

  it('pads key column to 14 chars', () => {
    const row = renderHelpRow('q', 'Quit', 60);
    expect(row).toContain('q             ');
  });
});

describe('renderHelpOverlay', () => {
  it('returns an array of strings', () => {
    const lines = renderHelpOverlay(80);
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBeGreaterThan(4);
  });

  it('starts with top border and ends with bottom border', () => {
    const lines = renderHelpOverlay(80);
    expect(lines[0]).toMatch(/^┌─+┐$/);
    expect(lines[lines.length - 1]).toMatch(/^└─+┘$/);
  });

  it('includes title line', () => {
    const lines = renderHelpOverlay(80);
    expect(lines.some(l => l.includes('Keyboard Shortcuts'))).toBe(true);
  });

  it('respects max width of 60', () => {
    const lines = renderHelpOverlay(40);
    const innerWidth = lines[0].length;
    expect(innerWidth).toBeLessThanOrEqual(60);
  });

  it('all lines have equal length', () => {
    const lines = renderHelpOverlay(80);
    const len = lines[0].length;
    for (const line of lines) {
      expect(line.length).toBe(len);
    }
  });
});
