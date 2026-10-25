import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi, afterEach } from 'vitest';
import DashboardPage from './DashboardPage';

function renderDashboard(versions: Record<string, unknown>[], lastUpdated: string | null = null) {
  return renderToStaticMarkup(
    <DashboardPage
      apps={[{ name: 'TestApp', displayName: 'Test app', versions, lastUpdated }]}
      totalVersionCount={versions.length}
      recentThresholdHours={48}
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
