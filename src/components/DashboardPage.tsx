import { useMemo, useState, memo } from 'react';
import { SearchRegular, AppGenericRegular, LockClosedRegular, DismissRegular } from '@fluentui/react-icons';

interface AppVersion {
  Version?: string;
  Type?: string;
  Architecture?: string;
  Language?: string;
  URI?: string;
  Size?: number | string;
  [key: string]: unknown;
}

interface AppEntry {
  name: string;
  displayName: string;
  versions: AppVersion[];
  lastUpdated: string | null;
}

interface DashboardPageProps {
  apps: AppEntry[];
  totalVersionCount: number;
  onSelectApp: (name: string) => void;
  recentThresholdHours: number;
}

const MODERN_TYPES = new Set(['msix', 'msixbundle', 'intunewin']);
const LEGACY_TYPES = new Set(['exe', 'msi', 'msp', 'cab', 'iso', 'zip', '7z']);

function getFileType(v: AppVersion): string {
  if (v.Type && typeof v.Type === 'string' && v.Type.trim()) return v.Type.trim().toLowerCase();
  if (v.URI) {
    const ext = v.URI.split('?')[0].split('.').pop();
    if (ext) return ext.toLowerCase();
  }
  return 'unknown';
}

function hasHashField(v: AppVersion): boolean {
  for (const key of ['Sha256', 'SHA256', 'sha256']) {
    const val = v[key];
    if (typeof val === 'string' && val.trim().length > 0) return true;
  }
  return false;
}

function tally(items: string[]): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item) continue;
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

interface BarChartProps {
  data: Array<{ label: string; count: number }>;
  maxItems?: number;
  colorVar?: string;
}

const BarChart = memo(function BarChart({ data, maxItems = 15, colorVar = '--accent' }: BarChartProps) {
  const rows = data.slice(0, maxItems);
  const max = rows[0]?.count ?? 1;

  return (
    <div className="bar-chart">
      {rows.map(({ label, count }) => (
        <div key={label} className="bar-chart__row">
          <span className="bar-chart__label" title={label}>{label || '—'}</span>
          <div className="bar-chart__track">
            <div
              className="bar-chart__fill"
              style={{
                width: `${(count / max) * 100}%`,
                background: `var(${colorVar})`,
              }}
            />
          </div>
          <span className="bar-chart__count">{count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
});

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

const StatCard = memo(function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card__value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      <span className="stat-card__label">{label}</span>
      {sub && <span className="stat-card__sub">{sub}</span>}
    </div>
  );
});

const ColumnChart = memo(function ColumnChart({ data }: { data: number[] }) {
  // data[0] = today, data[N-1] = oldest — reverse for left→right display
  const reversed = [...data].reverse();
  const max = Math.max(...reversed, 1);

  return (
    <div>
      <div className="column-chart">
        {reversed.map((count, idx) => {
          const daysAgo = reversed.length - 1 - idx;
          const label = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
          return (
            <div
              key={idx}
              className="column-chart__bar"
              style={{ height: count > 0 ? `${Math.max((count / max) * 100, 4)}%` : '0%' }}
              title={`${label}: ${count} app${count !== 1 ? 's' : ''} updated`}
            />
          );
        })}
      </div>
      <div className="column-chart__x-axis">
        <span>{data.length - 1}d ago</span>
        <span>Today</span>
      </div>
    </div>
  );
});

interface ModernityGroups {
  modern: number;
  legacy: number;
  other: number;
}

const ModernityBar = memo(function ModernityBar({ modern, legacy, other }: ModernityGroups) {
  const total = modern + legacy + other || 1;
  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  return (
    <div>
      <div className="stacked-bar">
        {modern > 0 && (
          <div
            className="stacked-bar__segment stacked-bar__segment--modern"
            style={{ flex: modern }}
            title={`Modern: ${modern.toLocaleString()} (${pct(modern)})`}
          />
        )}
        {legacy > 0 && (
          <div
            className="stacked-bar__segment stacked-bar__segment--legacy"
            style={{ flex: legacy }}
            title={`Legacy: ${legacy.toLocaleString()} (${pct(legacy)})`}
          />
        )}
        {other > 0 && (
          <div
            className="stacked-bar__segment stacked-bar__segment--other"
            style={{ flex: other }}
            title={`Other: ${other.toLocaleString()} (${pct(other)})`}
          />
        )}
      </div>
      <div className="stacked-bar__legend">
        {modern > 0 && (
          <span className="stacked-bar__legend-item stacked-bar__legend-item--modern">
            <span className="stacked-bar__swatch" />
            Modern · {modern.toLocaleString()} ({pct(modern)})
          </span>
        )}
        {legacy > 0 && (
          <span className="stacked-bar__legend-item stacked-bar__legend-item--legacy">
            <span className="stacked-bar__swatch" />
            Legacy · {legacy.toLocaleString()} ({pct(legacy)})
          </span>
        )}
        {other > 0 && (
          <span className="stacked-bar__legend-item stacked-bar__legend-item--other">
            <span className="stacked-bar__swatch" />
            Other · {other.toLocaleString()} ({pct(other)})
          </span>
        )}
      </div>
      <p className="stacked-bar__note">Modern = MSIX, MSIXBUNDLE, INTUNEWIN · Legacy = EXE, MSI, MSP, CAB, ISO, ZIP, 7Z</p>
    </div>
  );
});

const TopApps = memo(function TopApps({ apps, onSelectApp }: { apps: AppEntry[]; onSelectApp: (name: string) => void }) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card__title">Most variants</h2>
      <p className="dashboard-card__subtitle">Top 10 apps by version entry count</p>
      <ul className="msix-apps__list">
        {apps.map((app) => (
          <li
            key={app.name}
            className="msix-apps__item"
            role="button"
            tabIndex={0}
            onClick={() => onSelectApp(app.name)}
            onKeyDown={(e) => e.key === 'Enter' && onSelectApp(app.name)}
          >
            <span className="msix-apps__name">{app.displayName}</span>
            <span className="msix-apps__count">{app.versions.length}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

interface UriMatch {
  appName: string;
  displayName: string;
  matchedUri: string;
  version: AppVersion;
}

interface UriIndexEntry {
  uris: string[];
  appName: string;
  displayName: string;
  version: AppVersion;
}

function UriLookup({ apps, onSelectApp }: { apps: AppEntry[]; onSelectApp: (name: string) => void }) {
  const [query, setQuery] = useState('');

  const uriIndex = useMemo<UriIndexEntry[]>(() => {
    const index: UriIndexEntry[] = [];
    for (const app of apps) {
      for (const v of app.versions) {
        const uris: string[] = [];
        for (const val of Object.values(v)) {
          if (typeof val === 'string' && /^https?:\/\//i.test(val)) uris.push(val);
        }
        if (uris.length > 0) index.push({ uris, appName: app.name, displayName: app.displayName, version: v });
      }
    }
    return index;
  }, [apps]);

  const matches = useMemo<UriMatch[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 4) return [];
    const results: UriMatch[] = [];
    for (const entry of uriIndex) {
      for (const uri of entry.uris) {
        if (uri.toLowerCase().includes(q)) {
          results.push({ appName: entry.appName, displayName: entry.displayName, matchedUri: uri, version: entry.version });
          break;
        }
      }
      if (results.length >= 50) break;
    }
    return results;
  }, [uriIndex, query]);

  const hasQuery = query.trim().length >= 4;

  function highlightMatch(text: string, q: string) {
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="search-highlight">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div className="dashboard-card uri-lookup">
      <h2 className="dashboard-card__title">URI lookup</h2>
      <p className="dashboard-card__subtitle">Paste a download URL to find which app it belongs to</p>

      <div className="uri-lookup__input-row">
        <SearchRegular aria-hidden="true" className="uri-lookup__icon" style={{ width: 15, height: 15 }} />
        <input
          className="uri-lookup__input"
          type="text"
          placeholder="https://example.com/installer.exe"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          aria-label="Search by download URL"
        />
        {query && (
          <button className="uri-lookup__clear" onClick={() => setQuery('')} aria-label="Clear">
            <DismissRegular aria-hidden="true" style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {hasQuery && matches.length === 0 && (
        <p className="uri-lookup__empty">No matching URI found.</p>
      )}

      {matches.length > 0 && (
        <ul className="uri-lookup__results">
          {matches.map((m) => {
            const v = m.version;
            const meta = [v.Version, v.Architecture, v.Type ?? getFileType(v)].filter(Boolean).join(' · ');
            return (
              <li
                key={`${m.appName}|${m.matchedUri}`}
                className="uri-lookup__result"
                role="button"
                tabIndex={0}
                onClick={() => onSelectApp(m.appName)}
                onKeyDown={(e) => e.key === 'Enter' && onSelectApp(m.appName)}
              >
                <div className="uri-lookup__result-app">
                  <AppGenericRegular aria-hidden="true" style={{ width: 12, height: 12 }} />
                  <span className="uri-lookup__result-name">{m.displayName}</span>
                  {meta && <span className="uri-lookup__result-meta">{meta}</span>}
                </div>
                <div className="uri-lookup__result-uri">
                  {highlightMatch(m.matchedUri, query.trim())}
                </div>
              </li>
            );
          })}
          {matches.length === 50 && (
            <li className="uri-lookup__more">Showing first 50 matches — refine your query to narrow results</li>
          )}
        </ul>
      )}
    </div>
  );
}

function MsixCallout({ count }: { count: number }) {
  return (
    <div className="msix-callout">
      <LockClosedRegular aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0 }} />
      <p style={{ margin: 0 }}>
        <strong>{count} application{count !== 1 ? 's' : ''}</strong> in this feed provide downloads in{' '}
        <strong>.msix</strong> format — the modern Windows packaging format for Microsoft Store and sideloaded deployment.
      </p>
    </div>
  );
}

interface MsixAppsProps {
  apps: AppEntry[];
  onSelectApp: (name: string) => void;
}

const MsixApps = memo(function MsixApps({ apps, onSelectApp }: MsixAppsProps) {
  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card__title">MSIX downloads</h2>
      <p className="dashboard-card__subtitle">Apps that provide .msix installers ({apps.length})</p>
      <ul className="msix-apps__list">
        {apps.map((app) => {
          const msixCount = app.versions.filter((v) => getFileType(v) === 'msix').length;
          return (
            <li
              key={app.name}
              className="msix-apps__item"
              role="button"
              tabIndex={0}
              onClick={() => onSelectApp(app.name)}
              onKeyDown={(e) => e.key === 'Enter' && onSelectApp(app.name)}
            >
              <span className="msix-apps__name">{app.displayName}</span>
              <span className="msix-apps__count">{msixCount}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

function formatRelativeDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso));
  } catch {
    return '';
  }
}

interface RecentActivityProps {
  apps: AppEntry[];
  onSelectApp: (name: string) => void;
}

const RecentActivity = memo(function RecentActivity({ apps, onSelectApp }: RecentActivityProps) {
  const recent = useMemo(() => {
    const cutoff = Date.now() - 48 * 3600 * 1000;
    return apps
      .filter((a) => a.lastUpdated !== null && new Date(a.lastUpdated).getTime() >= cutoff)
      .sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime());
  }, [apps]);

  if (recent.length === 0) return null;

  return (
    <div className="dashboard-card recent-activity">
      <h2 className="dashboard-card__title">Recent activity</h2>
      <p className="dashboard-card__subtitle">Apps updated in the past 48 hours ({recent.length})</p>
      <ul className="recent-activity__list">
        {recent.map((app) => (
          <li
            key={app.name}
            className="recent-activity__item"
            role="button"
            tabIndex={0}
            onClick={() => onSelectApp(app.name)}
            onKeyDown={(e) => e.key === 'Enter' && onSelectApp(app.name)}
          >
            <span className="recent-activity__name">{app.displayName}</span>
            <span className="recent-activity__date">{formatRelativeDate(app.lastUpdated!)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default function DashboardPage({ apps, totalVersionCount, onSelectApp, recentThresholdHours }: DashboardPageProps) {
  const msixApps = useMemo(
    () =>
      apps
        .filter((app) => app.versions.some((v) => getFileType(v) === 'msix'))
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [apps]
  );

  const { archData, typeData, recentCount, arm64AppCount, hashCoveragePct, topApps, cadenceCounts, modernityGroups } = useMemo(() => {
    const archs: string[] = [];
    const types: string[] = [];
    const now = Date.now();
    const thresholdMs = recentThresholdHours * 3600 * 1000;
    let recentCount = 0;
    let hashCount = 0;
    const arm64AppNames = new Set<string>();
    const cadenceCounts = new Array(30).fill(0) as number[];
    let modern = 0, legacy = 0, other = 0;

    for (const app of apps) {
      if (app.lastUpdated) {
        try {
          const diff = now - new Date(app.lastUpdated).getTime();
          if (diff <= thresholdMs) recentCount++;
          const daysAgo = Math.floor(diff / 86400000);
          if (daysAgo >= 0 && daysAgo < 30) cadenceCounts[daysAgo]++;
        } catch { /* ignore */ }
      }
      for (const v of app.versions) {
        if (v.Architecture) archs.push(String(v.Architecture));
        if (v.Architecture === 'ARM64') arm64AppNames.add(app.name);
        const ft = getFileType(v);
        types.push(ft);
        if (MODERN_TYPES.has(ft)) modern++;
        else if (LEGACY_TYPES.has(ft)) legacy++;
        else other++;
        if (hasHashField(v)) hashCount++;
      }
    }

    const topApps = [...apps]
      .sort((a, b) => b.versions.length - a.versions.length)
      .slice(0, 10);

    return {
      archData: tally(archs),
      typeData: tally(types),
      recentCount,
      arm64AppCount: arm64AppNames.size,
      hashCoveragePct: totalVersionCount > 0 ? Math.round((hashCount / totalVersionCount) * 100) : 0,
      topApps,
      cadenceCounts,
      modernityGroups: { modern, legacy, other },
    };
  }, [apps, recentThresholdHours, totalVersionCount]);

  const uniqueArchCount = archData.length;
  const uniqueTypeCount = typeData.length;

  return (
    <div className="dashboard-page">
      {/* Update cadence — full width */}
      <div className="dashboard-card">
        <h2 className="dashboard-card__title">Update cadence</h2>
        <p className="dashboard-card__subtitle">Number of apps updated per day over the past 30 days</p>
        <ColumnChart data={cadenceCounts} />
      </div>

      {/* URI lookup */}
      <UriLookup apps={apps} onSelectApp={onSelectApp} />

      {/* Primary stat cards */}
      <div className="dashboard-stats">
        <StatCard label="Apps tracked" value={apps.length} />
        <StatCard label="Version entries" value={totalVersionCount} />
        <StatCard label="Architectures" value={uniqueArchCount} />
        <StatCard label="File types" value={uniqueTypeCount} />
      </div>

      {/* Insight stat cards */}
      {(arm64AppCount > 0 || hashCoveragePct > 0 || recentCount > 0) && (
        <div className="dashboard-stats dashboard-stats--insights">
          {arm64AppCount > 0 && <StatCard label="ARM64 apps" value={arm64AppCount} sub="have ARM64 downloads" />}
          {hashCoveragePct > 0 && <StatCard label="Hash coverage" value={`${hashCoveragePct}%`} sub="downloads include SHA256" />}
          {recentCount > 0 && <StatCard label="Updated recently" value={recentCount} sub="last 48 hours" />}
        </div>
      )}

      {/* Architecture + file type charts */}
      <div className="dashboard-charts">
        <div className="dashboard-card">
          <h2 className="dashboard-card__title">Architecture</h2>
          <p className="dashboard-card__subtitle">
            Version entries by CPU architecture
          </p>
          <BarChart data={archData} colorVar="--accent" />
        </div>

        <div className="dashboard-card">
          <h2 className="dashboard-card__title">File type</h2>
          <p className="dashboard-card__subtitle">
            Version entries by installer format
          </p>
          <BarChart data={typeData} maxItems={10} colorVar="--accent-hover" />
        </div>
      </div>

      {/* Installer modernity + top apps */}
      <div className="dashboard-charts">
        <div className="dashboard-card">
          <h2 className="dashboard-card__title">Installer modernity</h2>
          <p className="dashboard-card__subtitle">Modern vs. legacy packaging formats across all version entries</p>
          <ModernityBar {...modernityGroups} />
        </div>

        <TopApps apps={topApps} onSelectApp={onSelectApp} />
      </div>

      {/* MSIX callout + apps list */}
      {msixApps.length > 0 && <MsixCallout count={msixApps.length} />}
      {msixApps.length > 0 && <MsixApps apps={msixApps} onSelectApp={onSelectApp} />}

      {/* Recent activity */}
      <RecentActivity apps={apps} onSelectApp={onSelectApp} />
    </div>
  );
}
