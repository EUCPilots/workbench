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
