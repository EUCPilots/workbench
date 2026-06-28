import { useMemo, useState, memo } from 'react';
import { Card, CardHeader, Text, Input, Button } from '@fluentui/react-components';
import { SearchRegular, AppGenericRegular, LockClosedRegular, DismissRegular, GlobeRegular } from '@fluentui/react-icons';
import { FaGithub } from 'react-icons/fa';

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

const MODERN_TYPES = new Set(['msix', 'msixbundle', 'appx']);
const LEGACY_TYPES = new Set(['exe', 'msi', 'msp', 'cab', 'iso', 'zip', '7z']);
const AGE_THRESHOLDS_DAYS = [180, 270, 360, 450, 540, 730] as const;

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

const BarChart = memo(function BarChart({ data, maxItems = 15, colorVar = '--colorBrandBackground' }: BarChartProps) {
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
    <Card className="stat-card">
      <Text size={800} weight="bold" style={{ color: 'var(--colorBrandForeground1)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text size={200} weight="semibold" block>{label}</Text>
      {sub && <Text size={100} style={{ color: 'var(--colorNeutralForeground3)' }} block>{sub}</Text>}
    </Card>
  );
});

const ColumnChart = memo(function ColumnChart({ data }: { data: number[] }) {
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
    <Card>
      <CardHeader
        header={<Text weight="semibold">Most variants</Text>}
        description={<Text size={200}>Top 10 apps by version entry count</Text>}
      />
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
    </Card>
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
    <Card className="uri-lookup">
      <CardHeader
        header={<Text weight="semibold">URI lookup</Text>}
        description={<Text size={200}>Paste a download URL to find which app it belongs to</Text>}
      />

      <Input
        contentBefore={<SearchRegular aria-hidden="true" style={{ width: 15, height: 15 }} />}
        contentAfter={
          query ? (
            <Button
              appearance="subtle"
              size="small"
              icon={<DismissRegular style={{ width: 14, height: 14 }} />}
              onClick={() => setQuery('')}
              aria-label="Clear"
            />
          ) : undefined
        }
        placeholder="https://example.com/installer.exe"
        value={query}
        onChange={(_e, data) => setQuery(data.value)}
        spellCheck={false}
        autoComplete="off"
        aria-label="Search by download URL"
        style={{ fontFamily: 'Cascadia Code, Consolas, monospace', width: '100%' }}
      />

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
    </Card>
  );
}

function MsixCallout({ count }: { count: number }) {
  return (
    <div className="msix-callout">
      <LockClosedRegular aria-hidden="true" style={{ width: 16, height: 16, flexShrink: 0 }} />
      <p style={{ margin: 0 }}>
        <strong>{count} application{count !== 1 ? 's' : ''}</strong> in this feed provide downloads in{' '}
        <strong>.msix</strong>, <strong>.msixbundle</strong>, or <strong>.appx</strong> formats - modern Windows packaging for Microsoft Store and sideloaded deployment.
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
    <Card>
      <CardHeader
        header={<Text weight="semibold">MSIX downloads</Text>}
        description={<Text size={200}>Apps that provide .msix, .msixbundle, or .appx installers ({apps.length})</Text>}
      />
      <ul className="msix-apps__list">
        {apps.map((app) => {
          const msixCount = app.versions.filter((v) => MODERN_TYPES.has(getFileType(v))).length;
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
    </Card>
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

function formatLastUpdatedDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function getAppUri(app: AppEntry): string | null {
  for (const version of app.versions) {
    if (typeof version.URI === 'string' && version.URI.trim().length > 0) {
      return version.URI.trim();
    }
  }
  return null;
}

function isGithubUri(uri: string | null): boolean {
  if (!uri) return false;

  try {
    const parsed = new URL(uri);
    return parsed.protocol === 'https:' && parsed.hostname.toLowerCase() === 'github.com';
  } catch {
    return uri.toLowerCase().startsWith('https://github.com');
  }
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
    <Card className="recent-activity">
      <CardHeader
        header={<Text weight="semibold">Recent activity</Text>}
        description={<Text size={200}>Apps updated in the past 48 hours ({recent.length})</Text>}
      />
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
    </Card>
  );
});

export default function DashboardPage({ apps, totalVersionCount, onSelectApp, recentThresholdHours }: DashboardPageProps) {
  const [ageThresholdDays, setAgeThresholdDays] = useState<number>(180);

  const agedApps = useMemo(() => {
    const now = Date.now();

    return apps
      .flatMap((app) => {
        if (!app.lastUpdated) return [];

        const parsed = new Date(app.lastUpdated).getTime();
        if (Number.isNaN(parsed)) return [];
        const sourceUri = getAppUri(app);

        const ageDays = Math.floor((now - parsed) / 86400000);
        if (ageDays < ageThresholdDays || ageDays < 0) return [];

        return [{ ...app, ageDays, sourceUri, sourceIsGithub: isGithubUri(sourceUri) }];
      })
      .sort((a, b) => b.ageDays - a.ageDays || a.displayName.localeCompare(b.displayName));
  }, [apps, ageThresholdDays]);

  const msixApps = useMemo(
    () =>
      apps
        .filter((app) => app.versions.some((v) => MODERN_TYPES.has(getFileType(v))))
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
      <Card>
        <CardHeader
          header={<Text weight="semibold">Update cadence</Text>}
          description={<Text size={200}>Number of apps updated per day over the past 30 days</Text>}
        />
        <ColumnChart data={cadenceCounts} />
      </Card>

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
        <Card>
          <CardHeader
            header={<Text weight="semibold">Architecture</Text>}
            description={<Text size={200}>Version entries by CPU architecture</Text>}
          />
          <BarChart data={archData} colorVar="--colorBrandBackground" />
        </Card>

        <Card>
          <CardHeader
            header={<Text weight="semibold">File type</Text>}
            description={<Text size={200}>Version entries by installer format</Text>}
          />
          <BarChart data={typeData} maxItems={10} colorVar="--colorBrandBackgroundPressed" />
        </Card>
      </div>

      {/* Installer modernity + top apps */}
      <div className="dashboard-charts">
        <Card>
          <CardHeader
            header={<Text weight="semibold">Installer modernity</Text>}
            description={<Text size={200}>Modern vs. legacy packaging formats across all version entries</Text>}
          />
          <ModernityBar {...modernityGroups} />
        </Card>

        <TopApps apps={topApps} onSelectApp={onSelectApp} />
      </div>

      {/* MSIX callout + apps list */}
      {msixApps.length > 0 && <MsixCallout count={msixApps.length} />}
      {msixApps.length > 0 && <MsixApps apps={msixApps} onSelectApp={onSelectApp} />}

      {/* Recent activity */}
      <RecentActivity apps={apps} onSelectApp={onSelectApp} />

      {/* Applications by age */}
      <Card>
        <CardHeader
          header={<Text weight="semibold">Applications by age</Text>}
          description={<Text size={200}>List apps older than a selected age threshold</Text>}
        />

        <div className="age-table__controls" role="group" aria-label="Application age filter">
          <Text size={200} className="age-table__controls-label">Older than</Text>
          <div className="age-table__buttons">
            {AGE_THRESHOLDS_DAYS.map((days) => (
              <Button
                key={days}
                size="small"
                appearance={ageThresholdDays === days ? 'primary' : 'outline'}
                onClick={() => setAgeThresholdDays(days)}
                aria-pressed={ageThresholdDays === days}
              >
                {days} days
              </Button>
            ))}
          </div>
          <Text size={200} className="age-table__count">
            {agedApps.length.toLocaleString()} app{agedApps.length !== 1 ? 's' : ''}
          </Text>
        </div>

        {agedApps.length === 0 ? (
          <p className="age-table__empty">No applications match this age threshold.</p>
        ) : (
          <div className="table-wrapper age-table__wrapper">
            <table className="version-table age-table" aria-label="Applications by age">
              <thead>
                <tr>
                  <th scope="col">Application</th>
                  <th scope="col">Age (days)</th>
                  <th scope="col">Last update</th>
                  <th scope="col" className="age-table__source-header">Source</th>
                </tr>
              </thead>
              <tbody>
                {agedApps.map((app) => (
                  <tr
                    key={app.name}
                    className="age-table__row"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectApp(app.name)}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectApp(app.name)}
                  >
                    <td>{app.displayName}</td>
                    <td>{app.ageDays.toLocaleString()}</td>
                    <td>{formatLastUpdatedDate(app.lastUpdated!)}</td>
                    <td className="age-table__source-cell">
                      {app.sourceIsGithub ? (
                        <FaGithub className="age-table__source-icon" aria-label="GitHub source" title="GitHub source" />
                      ) : (
                        <GlobeRegular className="age-table__source-icon" aria-label="Non-GitHub source" title="Non-GitHub source" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
