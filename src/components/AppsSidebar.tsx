import { useMemo, useEffect, useRef, memo } from 'react';

function isRecent(lastUpdated: string | null, thresholdMs: number): boolean {
  if (!lastUpdated) return false;
  try {
    return Date.now() - new Date(lastUpdated).getTime() <= thresholdMs;
  } catch {
    return false;
  }
}

const THRESHOLD_PRESETS = [
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
  { label: '72h', hours: 72 },
  { label: '1w', hours: 168 },
];

interface AppItem {
  name: string;
  displayName: string;
  lastUpdated: string | null;
}

interface AppsSidebarProps {
  apps: AppItem[];
  selectedApp: string | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectApp: (name: string) => void;
  totalCount: number;
  favourites: Set<string>;
  onToggleFavourite: (name: string) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
  recentThresholdHours: number;
  onThresholdChange: (h: number) => void;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="8,1.5 10,6 15,6.5 11.5,10 12.5,15 8,12.5 3.5,15 4.5,10 1,6.5 6,6" />
    </svg>
  );
}

interface AppListItemProps {
  app: AppItem;
  isActive: boolean;
  isFav: boolean;
  onSelect: (name: string) => void;
  onToggleFavourite: (name: string) => void;
  thresholdMs: number;
}

const AppListItem = memo(function AppListItem({ app, isActive, isFav, onSelect, onToggleFavourite, thresholdMs }: AppListItemProps) {
  const recent = isRecent(app.lastUpdated, thresholdMs);
  return (
    <li
      data-name={app.name}
      className={`app-list__item${isActive ? ' app-list__item--active' : ''}`}
      onClick={() => onSelect(app.name)}
      role="option"
      aria-selected={isActive}
      title={recent ? `${app.displayName} — updated recently` : app.displayName}
    >
      <span className="app-list__item-name">{app.displayName}</span>
      <span className="app-list__item-actions">
        {recent && (
          <span className="app-list__badge" aria-label="Updated recently" title="Updated in the last 48 hours" />
        )}
        <button
          className={`app-list__star${isFav ? ' app-list__star--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavourite(app.name); }}
          aria-label={isFav ? `Unpin ${app.displayName}` : `Pin ${app.displayName}`}
          title={isFav ? 'Remove from pinned' : 'Pin to top'}
        >
          <StarIcon filled={isFav} />
        </button>
      </span>
    </li>
  );
});

export default function AppsSidebar({
  apps,
  selectedApp,
  searchQuery,
  onSearchChange,
  onSelectApp,
  totalCount,
  favourites,
  onToggleFavourite,
  searchRef,
  recentThresholdHours,
  onThresholdChange,
}: AppsSidebarProps) {
  const thresholdMs = recentThresholdHours * 3600 * 1000;
  const listRef = useRef<HTMLUListElement>(null);

  const { pinned, rest } = useMemo(() => {
    const pinned = apps.filter((a) => favourites.has(a.name));
    const rest = apps.filter((a) => !favourites.has(a.name));
    return { pinned, rest };
  }, [apps, favourites]);

  // Scroll the active item into view when selection changes via keyboard
  useEffect(() => {
    if (!selectedApp || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-name="${CSS.escape(selectedApp)}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedApp]);

  function renderItem(app: AppItem) {
    return (
      <AppListItem
        key={app.name}
        app={app}
        isActive={selectedApp === app.name}
        isFav={favourites.has(app.name)}
        onSelect={onSelectApp}
        onToggleFavourite={onToggleFavourite}
        thresholdMs={thresholdMs}
      />
    );
  }

  return (
    <div className="apps-panel">
      <p className="apps-panel__count">
        Applications {apps.length.toLocaleString()} of {totalCount.toLocaleString()}
      </p>

      <div className="apps-panel__search">
        <input
          ref={searchRef}
          type="search"
          className="search-input"
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search applications"
        />
      </div>

      <ul ref={listRef} className="app-list" role="listbox" aria-label="Application list">
        {pinned.length > 0 && (
          <>
            {pinned.map(renderItem)}
            <li className="app-list__divider" role="separator" aria-hidden="true" />
          </>
        )}
        {rest.map(renderItem)}
      </ul>

      <div className="apps-panel__settings">
        <span className="apps-panel__settings-label">Recent:</span>
        <div className="apps-panel__settings-presets">
          {THRESHOLD_PRESETS.map(({ label, hours }) => (
            <button
              key={hours}
              className={`apps-panel__preset-btn${recentThresholdHours === hours ? ' apps-panel__preset-btn--active' : ''}`}
              onClick={() => onThresholdChange(hours)}
              title={`Mark apps updated in the last ${label} as recent`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
