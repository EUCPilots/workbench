import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AppsSidebar from './AppsSidebar';
import AppDetails from './AppDetails';
import AboutPage from './AboutPage';
import DashboardPage from './DashboardPage';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import ErrorBoundary from './ErrorBoundary';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

interface AppVersion {
  Version?: string;
  Type?: string;
  Architecture?: string;
  Language?: string;
  URI?: string;
  Size?: number | string;
  [key: string]: unknown;
}

interface AppRecord {
  name: string;
  displayName: string;
  versions: AppVersion[];
  lastUpdated: string | null;
}

interface AppData {
  meta: {
    appCount: number;
    versionCount: number;
    generatedAt: string;
  };
  apps: AppRecord[];
}

interface AppEntry {
  name: string;
  displayName: string;
  versions: AppVersion[];
  lastUpdated: string | null;
}

type Tab = 'apps' | 'dashboard' | 'about';

interface AppsPageProps {
  base: string;
}

export default function AppsPage({ base }: AppsPageProps) {
  const [tab, setTab] = useState<Tab>(() => {
    if (typeof window === 'undefined') return 'apps';
    const hash = window.location.hash.slice(1);
    if (hash === 'dashboard') return 'dashboard';
    if (hash === 'about') return 'about';
    return 'apps';
  });
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [favourites, setFavourites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('favouriteApps');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [recentThresholdHours, setRecentThresholdHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('recentThresholdHours');
      const n = saved ? parseInt(saved, 10) : NaN;
      return isNaN(n) ? 48 : n;
    } catch {
      return 48;
    }
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const sidebarSearchRef = useRef<HTMLInputElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 150);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    setIsMobile(mq.matches);
    if (mq.matches) setSidebarOpen(false);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const url = `${base}appdata.json`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load app data (${r.status})`);
        return r.json();
      })
      .then((data: AppData) => {
        setAppData(data);
        if (data.apps.length > 0) {
          const hash = window.location.hash.slice(1);
          if (hash && data.apps.some((a) => a.name === hash)) {
            setSelectedApp(hash);
          } else {
            const saved = localStorage.getItem('selectedApp');
            const valid = saved && data.apps.some((a) => a.name === saved);
            setSelectedApp(valid ? saved : data.apps[0].name);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [base]);

  const allApps: AppEntry[] = useMemo(() => {
    if (!appData) return [];
    return appData.apps.map((a) => ({
      name: a.name,
      displayName: a.displayName,
      versions: a.versions,
      lastUpdated: a.lastUpdated,
    }));
  }, [appData]);

  // Sync selection when the user navigates with browser back/forward
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash.slice(1);
      if (hash === 'dashboard') {
        setTab('dashboard');
      } else if (hash === 'about') {
        setTab('about');
      } else if (hash && allApps.some((a) => a.name === hash)) {
        setSelectedApp(hash);
        setTab('apps');
      }
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [allApps]);

  const filteredApps = useMemo(() => {
    if (!debouncedQuery.trim()) return allApps;
    const q = debouncedQuery.toLowerCase();
    return allApps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.displayName.toLowerCase().includes(q)
    );
  }, [allApps, debouncedQuery]);

  // Mirrors the pinned-first order shown in the sidebar, used for arrow-key nav
  const orderedApps = useMemo(() => {
    const pinned = filteredApps.filter((a) => favourites.has(a.name));
    const rest = filteredApps.filter((a) => !favourites.has(a.name));
    return [...pinned, ...rest];
  }, [filteredApps, favourites]);

  const handleSelectApp = useCallback((name: string) => {
    setSelectedApp(name);
    localStorage.setItem('selectedApp', name);
    history.replaceState(null, '', `#${name}`);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleGlobalSearchSelect = useCallback((appName: string) => {
    setTab('apps');
    setSelectedApp(appName);
    localStorage.setItem('selectedApp', appName);
    history.replaceState(null, '', `#${appName}`);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleToggleFavourite = useCallback((name: string) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      localStorage.setItem('favouriteApps', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  // Keyboard navigation: / focuses sidebar search, ↑↓ moves through app list, ? opens shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

      if (e.key === '?' && !inInput) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }

      if (e.key === 'f' && !inInput && selectedApp) {
        e.preventDefault();
        handleToggleFavourite(selectedApp);
        return;
      }

      if (tab !== 'apps') return;

      if (e.key === '/' && !inInput) {
        e.preventDefault();
        sidebarSearchRef.current?.focus();
        sidebarSearchRef.current?.select();
        return;
      }

      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !inInput) {
        e.preventDefault();
        const idx = orderedApps.findIndex((a) => a.name === selectedApp);
        const next =
          e.key === 'ArrowDown'
            ? Math.min(idx + 1, orderedApps.length - 1)
            : Math.max(idx - 1, 0);
        const nextApp = orderedApps[next];
        if (nextApp && nextApp.name !== selectedApp) {
          handleSelectApp(nextApp.name);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tab, orderedApps, selectedApp, handleSelectApp, handleToggleFavourite]);

  const selectedEntry = useMemo(
    () => allApps.find((a) => a.name === selectedApp) ?? null,
    [allApps, selectedApp]
  );

  const NAV_TABS: { id: Tab; label: string }[] = [
    { id: 'apps', label: 'Apps' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'about', label: 'About' },
  ];

  function handleThresholdChange(h: number) {
    setRecentThresholdHours(h);
    localStorage.setItem('recentThresholdHours', String(h));
  }

  function handleTabChange(t: Tab) {
    setTab(t);
    if (t === 'dashboard') history.replaceState(null, '', '#dashboard');
    else if (t === 'about') history.replaceState(null, '', '#about');
    else if (selectedApp) history.replaceState(null, '', `#${selectedApp}`);
    else history.replaceState(null, '', location.pathname);
    if (isMobile) setSidebarOpen(false);
  }

  function handleSidebarTouchStart(e: React.TouchEvent) {
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  }

  function handleSidebarTouchEnd(e: React.TouchEvent) {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    const dy = e.changedTouches[0].clientY - swipeStartY.current;
    swipeStartX.current = null;
    swipeStartY.current = null;
    // Left swipe: horizontal > 50px, vertical drift < half the horizontal
    if (dx < -50 && Math.abs(dy) < Math.abs(dx) / 2) {
      setSidebarOpen(false);
    }
  }

  return (
    <>
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sidebarOpen}
          >
            <span className="sidebar-toggle-btn__icon">&#9776;</span>
          </button>
          <span className="app-header__title">Evergreen Workbench</span>
        </div>
        <div className="app-header__right">
          {appData && (
            <>
              <GlobalSearch apps={allApps} onSelect={handleGlobalSearchSelect} />
              <span className="app-header__count">
                <span className="version-dot" />
                {appData.meta.appCount} apps tracked
              </span>
            </>
          )}
          <button
            className="shortcuts-help-btn"
            onClick={() => setShowShortcuts(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Body */}
      <div className="app-body">
        {/* Mobile overlay backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`sidebar${sidebarOpen ? ' sidebar--open' : ' sidebar--closed'}${isMobile ? ' sidebar--mobile' : ''}`}
          onTouchStart={isMobile ? handleSidebarTouchStart : undefined}
          onTouchEnd={isMobile ? handleSidebarTouchEnd : undefined}
        >
          <nav className="sidebar-nav" aria-label="Main navigation">
            {NAV_TABS.map((t) => (
              <button
                key={t.id}
                className={`sidebar-nav__item${tab === t.id ? ' sidebar-nav__item--active' : ''}`}
                onClick={() => handleTabChange(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'apps' && (
            <>
              {loading ? (
                <div className="empty-state">
                  <div className="loading-spinner" />
                  <span className="empty-state__subtitle">Loading applications…</span>
                </div>
              ) : error ? (
                <div className="empty-state">
                  <span className="empty-state__title">Error loading data</span>
                  <span className="empty-state__subtitle">{error}</span>
                </div>
              ) : (
                <AppsSidebar
                  apps={filteredApps}
                  selectedApp={selectedApp}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSelectApp={handleSelectApp}
                  totalCount={allApps.length}
                  favourites={favourites}
                  onToggleFavourite={handleToggleFavourite}
                  searchRef={sidebarSearchRef}
                  recentThresholdHours={recentThresholdHours}
                  onThresholdChange={handleThresholdChange}
                />
              )}
            </>
          )}
        </aside>

        {/* Main content */}
        <main id="main-content" className={`main-content${!sidebarOpen || isMobile ? ' main-content--expanded' : ''}`}>
          {tab === 'apps' && (
            <>
              {loading ? (
                <div className="empty-state" style={{ flex: 1 }}>
                  <div className="loading-spinner" />
                </div>
              ) : selectedEntry ? (
                <ErrorBoundary key={selectedEntry.name} label="AppDetails">
                  <AppDetails
                    key={selectedEntry.name}
                    appName={selectedEntry.name}
                    displayName={selectedEntry.displayName}
                    versions={selectedEntry.versions}
                    lastUpdated={selectedEntry.lastUpdated}
                    onBack={isMobile ? () => setSidebarOpen(true) : undefined}
                    base={base}
                  />
                </ErrorBoundary>
              ) : (
                <div className="empty-state" style={{ flex: 1 }}>
                  <span className="empty-state__icon">📦</span>
                  <span className="empty-state__title">Select an application</span>
                  <span className="empty-state__subtitle">
                    Choose an app from the list to view version details.
                  </span>
                </div>
              )}
            </>
          )}

          {tab === 'dashboard' && (
            <ErrorBoundary label="DashboardPage">
              <DashboardPage
                apps={allApps}
                totalVersionCount={appData?.meta.versionCount ?? 0}
                onSelectApp={handleGlobalSearchSelect}
                recentThresholdHours={recentThresholdHours}
              />
            </ErrorBoundary>
          )}

          {tab === 'about' && (
            <AboutPage
              appCount={appData?.meta.appCount ?? 0}
              versionCount={appData?.meta.versionCount ?? 0}
              generatedAt={appData?.meta.generatedAt ?? ''}
            />
          )}
        </main>
      </div>
    </>
  );
}
