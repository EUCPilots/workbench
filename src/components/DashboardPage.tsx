import { useMemo, useState, memo } from 'react';

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

function getFileType(v: AppVersion): string {
  if (v.Type && typeof v.Type === 'string' && v.Type.trim()) return v.Type.trim().toLowerCase();
  if (v.URI) {
    const ext = v.URI.split('?')[0].split('.').pop();
    if (ext) return ext.toLowerCase();
  }
  return 'unknown';
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

  // Pre-extract all HTTP URIs once per data load, not per keystroke
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
          break; // one match per version row
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
        <svg className="uri-lookup__icon" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.5" y1="10.5" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
          <button className="uri-lookup__clear" onClick={() => setQuery('')} aria-label="Clear">✕</button>
        )}
      </div>

      {hasQuery && matches.length === 0 && (
        <p className="uri-lookup__empty">No matching URI found.</p>
      )}

      {matches.length > 0 && (
        <ul className="uri-lookup__results">
          {matches.map((m, i) => {
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
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="5" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
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
  const { archData, typeData, recentCount } = useMemo(() => {
    const archs: string[] = [];
    const types: string[] = [];
    const now = Date.now();
    const thresholdMs = recentThresholdHours * 3600 * 1000;
    let recentCount = 0;

    for (const app of apps) {
      if (app.lastUpdated) {
        try {
          if (now - new Date(app.lastUpdated).getTime() <= thresholdMs) recentCount++;
        } catch { /* ignore */ }
      }
      for (const v of app.versions) {
        if (v.Architecture) archs.push(String(v.Architecture));
        types.push(getFileType(v));
      }
    }

    return {
      archData: tally(archs),
      typeData: tally(types),
      recentCount,
    };
  }, [apps, recentThresholdHours]);

  const uniqueArchCount = archData.length;
  const uniqueTypeCount = typeData.length;

  return (
    <div className="dashboard-page">
      {/* URI lookup */}
      <UriLookup apps={apps} onSelectApp={onSelectApp} />

      {/* Stat cards */}
      <div className="dashboard-stats">
        <StatCard label="Apps tracked" value={apps.length} />
        <StatCard label="Version entries" value={totalVersionCount} />
        <StatCard label="Architectures" value={uniqueArchCount} />
        <StatCard label="File types" value={uniqueTypeCount} />
        {recentCount > 0 && (
          <StatCard label="Updated recently" value={recentCount} sub="last 48 hours" />
        )}
      </div>

      {/* Charts row */}
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

      {/* Recent activity */}
      <RecentActivity apps={apps} onSelectApp={onSelectApp} />

    </div>
  );
}
