interface AboutProps {
  appCount: number;
  versionCount: number;
  generatedAt: string;
}

const INFO_ROWS = [
  { label: 'Author', value: 'Aaron Parker (stealthpuppy)' },
  { label: 'Copyright', value: '(c) EUCPilots. Licensed under the MIT Licence.' },
  {
    label: 'License',
    value: 'https://github.com/EUCPilots/workbench/blob/main/LICENSE',
    href: 'https://github.com/EUCPilots/workbench/blob/main/LICENSE',
  },
  {
    label: 'Evergreen module',
    value: 'https://www.powershellgallery.com/packages/Evergreen/',
    href: 'https://www.powershellgallery.com/packages/Evergreen/',
  },
  {
    label: 'Project',
    value: 'https://github.com/EUCPilots/workbench',
    href: 'https://github.com/EUCPilots/workbench',
  },
];

const CHANGELOG = [
  {
    version: '3.0.7',
    date: '2026-04-04',
    changes: [
      'Upgraded Astro from v5 to v6, React from v18 to v19, and @astrojs/react from v4 to v5',
      'Added explicit buildBase configuration to the PWA plugin to fix a manifest.webmanifest 404 on the deployed site',
    ],
  },
  {
    version: '3.0.6',
    date: '2026-03-29',
    changes: [
      'About information is now accessible via the (i) button in the header, opening a modal with project details',
      'Added theme-color meta tags so the browser chrome follows the active light or dark theme',
      'Updated date in the app detail header is now displayed as a styled pill matching the Get-EvergreenApp and RSS buttons, with a hover highlight effect',
      'Ring, Language, and Throttle columns now use dropdown filters in the version details table when those fields are present in the data',
    ],
  },
  {
    version: '3.0.5',
    date: '2026-03-23',
    changes: [
      'Dashboard shows a callout and dedicated list of applications that provide .msix format downloads',
      'Dashboard, About, and app detail views can now be linked to directly via URL hash (#dashboard, #about, #AppName)',
    ],
  },
  {
    version: '3.0.4',
    date: '2026-03-21',
    changes: [
      'Search modal and help dialog backgrounds are now fully opaque',
      'Recent activity on the Dashboard now shows all apps updated in the past 48 hours instead of the top 10',
      'Dashboard stat cards are distributed evenly across the full page width',
      'Fixed stale closure in global search keyboard handler that could prevent search history from saving correctly',
      'Fixed uncleaned timeouts in the version details copy-to-clipboard functions that could update state after unmount',
      'Fixed tab focus escaping the global search modal when no results are shown',
      'Fixed clickable list items in Dashboard being inaccessible to keyboard and screen reader users',
      'Fixed unstable row keys and index-based copy state in the version table that caused visual state to appear on the wrong row after sorting',
      'Replaced render-time state mutation with useEffect for resetting filters when switching apps',
    ],
  },
  {
    version: '3.0.3',
    date: '2026-03-18',
    changes: [
      'Add support for installing the Workbench as a Progressive Web App (PWA) with an app manifest and service worker for offline caching',
    ],
  },
  {
    version: '3.0.2',
    date: '2026-03-18',
    changes: [
      'F key toggles the favourite/pin on the currently selected app',
      'Global search (Ctrl+K) shows recent search history from local storage when the input is empty',
      'Dashboard shows a Recent activity card listing the 10 most recently updated apps',
      'Column visibility chooser in the version details table, persisted per app to local storage',
      'Removed unused language data computation from the Dashboard',
      'Fixed hook ordering in AppsPage that caused a server-side rendering error',
    ],
  },
  {
    version: '3.0.1',
    date: '2026-03-17',
    changes: [
      'Keyboard shortcuts help modal (? key or header button)',
      'Persistent Architecture and Type column filters per app saved to local storage',
      'Configurable "updated recently" threshold (24h / 48h / 72h / 1w) in sidebar footer',
    ],
  },
  {
    version: '3.0.0',
    date: '2026-03-17',
    changes: [
      'Replaced Jekyll static site generator with Astro and React',
      'New two-panel SPA-style UI with sidebar app list and detail panel',
      'Light and dark mode support with preference saved to local storage',
      'Sortable columns in the version details table',
      'Architecture and file type filters for version details',
      'Export to CSV for filtered and sorted version data',
      'App data loaded at build time from JSON files via Astro static endpoint',
      'Deployed to GitHub Pages via updated GitHub Actions workflow',
    ],
  },
];

export default function AboutPage({ appCount, versionCount, generatedAt }: AboutProps) {
  return (
    <div className="about-page">
      <div className="about-card">
        {INFO_ROWS.map((row) => (
          <div className="about-card__row" key={row.label}>
            <span className="about-card__label">{row.label}</span>
            <span className="about-card__value">
              {row.href ? (
                <a href={row.href} target="_blank" rel="noopener noreferrer">
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </span>
          </div>
        ))}
        <div className="about-card__row">
          <span className="about-card__label">Applications tracked</span>
          <span className="about-card__value">{appCount.toLocaleString()}</span>
        </div>
        <div className="about-card__row">
          <span className="about-card__label">Unique installers</span>
          <span className="about-card__value">{versionCount.toLocaleString()}</span>
        </div>
        <div className="about-card__row">
          <span className="about-card__label">Data last generated</span>
          <span className="about-card__value">
            {new Date(generatedAt).toLocaleString(undefined, {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </span>
        </div>
      </div>

      <div className="about-description">
        <p className="about-description__title">Description</p>
        <p className="about-description__body">
          Evergreen Workbench uses the{' '}
          <a href="https://eucpilots.com/evergreen-docs/" target="_blank" rel="noopener noreferrer">
            Evergreen
          </a>{' '}
          PowerShell module to track the latest versions and download URIs for {appCount} Windows
          applications. Application data is updated every 24 hours via a GitHub Actions workflow
          and published here as a static site.
        </p>
      </div>

      <div className="about-description">
        <p className="about-description__title">Change log</p>
        {CHANGELOG.map((entry) => (
          <div key={entry.version} className="changelog-entry">
            <p className="changelog-version">
              {entry.version} <span className="changelog-date">{entry.date}</span>
            </p>
            <ul className="changelog-list">
              {entry.changes.map((change, i) => (
                <li key={i}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
