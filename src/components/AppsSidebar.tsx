import { useMemo, useEffect, useRef } from 'react';

const HOURS_48 = 48 * 60 * 60 * 1000;

function isRecent(lastUpdated: string | null): boolean {
  if (!lastUpdated) return false;
  try {
    return Date.now() - new Date(lastUpdated).getTime() <= HOURS_48;
  } catch {
    return false;
  }
}

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
}: AppsSidebarProps) {
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
    const recent = isRecent(app.lastUpdated);
    const isFav = favourites.has(app.name);
    const isActive = selectedApp === app.name;
    return (
      <li
        key={app.name}
        data-name={app.name}
        className={`app-list__item${isActive ? ' app-list__item--active' : ''}`}
        onClick={() => onSelectApp(app.name)}
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
    </div>
  );
}
