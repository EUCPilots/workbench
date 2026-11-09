import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, afterEach } from 'vitest';
import DashboardPage from './DashboardPage';

function renderDashboard(
  versions: Record<string, unknown>[],
  lastUpdated: string | null = null,
  recentThresholdHours = 48
) {
  return renderToStaticMarkup(
    <DashboardPage
      apps={[{ name: 'TestApp', displayName: 'Test app', versions, lastUpdated }]}
      totalVersionCount={versions.length}
      recentThresholdHours={recentThresholdHours}
      onSelectApp={() => {}}
    />
  );
}

afterEach(() => vi.useRealTimers());

describe('dashboard hash coverage', () => {
  it.each(['Sha256', 'SHA256', 'sha256', 'Sha1', 'SHA1', 'sha1', 'Hash', 'HASH', 'hash'])(
    'includes a non-empty %s property',
    (key) => {
      const html = renderDashboard([{ [key]: 'abc123' }, {}]);
      expect(html).toContain('50%');
      expect(html).toContain('downloads include SHA256, SHA1, or Hash');
    }
  );

  it('counts a download with multiple hash fields only once', () => {
    const html = renderDashboard([{ Sha256: 'abc', Sha1: 'def', Hash: 'ghi' }, {}]);
    expect(html).toContain('50%');
  });

  it('ignores empty, non-string, and unrelated hash properties', () => {
    const html = renderDashboard([
      { Sha256: ' ', Sha1: '', Hash: null },
      { Sha256: 123, Sha1: false, Hash: {} },
      { OtherHash: 'abc', SHA512: 'def' },
    ]);
    expect(html).not.toContain('Hash coverage');
  });

  it('handles no version entries', () => {
    expect(renderDashboard([])).not.toContain('Hash coverage');
  });
});

describe('dashboard update cadence', () => {
  it('labels all daily hover targets, including zero-count days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-25T12:00:00Z'));
    const html = renderDashboard([{}], '2026-10-25T11:00:00Z');

    expect(html.match(/class="column-chart__day"/g)).toHaveLength(30);
    expect(html).toContain('aria-label="Today: 1 app updated"');
    expect(html).toContain('aria-label="1d ago: 0 apps updated"');
    expect(html).toContain('aria-label="29d ago: 0 apps updated"');
    expect(html).toContain('style="height:100%;transform:scaleY(1)"');
    expect(html.match(/role="img" tabindex="0"/g)).toHaveLength(30);
  });

  it('derives daily labels from the current app data', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-25T12:00:00Z'));

    expect(renderDashboard([{}], null)).toContain('aria-label="Today: 0 apps updated"');
    expect(renderDashboard([{}], '2026-10-25T11:00:00Z')).toContain('aria-label="Today: 1 app updated"');
    expect(renderDashboard([{}], '2026-10-24T11:00:00Z')).toContain('aria-label="1d ago: 1 app updated"');
  });
});

describe('dashboard data presentation', () => {
  it('does not render URI lookup', () => {
    const html = renderDashboard([{ URI: 'https://example.com/installer.exe' }]);

    expect(html).not.toContain('URI lookup');
    expect(html).not.toContain('Search by download URL');
  });

  it('normalizes ARM64 architecture casing in the stat and chart', () => {
    const html = renderDashboard([
      { Architecture: 'arm64' },
      { Architecture: 'ARM64' },
    ]);

    expect(html).toContain('ARM64 apps');
    expect(html).toContain('>ARM64</span>');
    expect(html).toContain('>2</span>');
  });

  it('uses the URL pathname to find installer extensions', () => {
    const html = renderDashboard([
      { URI: 'https://example.com/download/installer.exe?source=feed' },
      { URI: 'https://example.com/latest/' },
      { URI: 'https://example.com/download/windows64' },
    ]);

    expect(html).toContain('>exe</span>');
    expect(html).toContain('>unknown</span>');
    expect(html).not.toContain('com/latest/');
    expect(html).not.toContain('windows64</span>');
  });

  it('labels the recent count with the active threshold', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-25T12:00:00Z'));
    const html = renderDashboard([{}], '2026-10-23T00:00:00Z', 72);

    expect(html).toContain('last 72 hours');
    expect(html).not.toContain('last 48 hours');
  });

  it('includes APPX in the modern installer explanation', () => {
    const html = renderDashboard([{ Type: 'appx' }]);

    expect(html).toContain('Modern = MSIX, MSIXBUNDLE, APPX');
  });
});
