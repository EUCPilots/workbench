import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { SearchRegular, HistoryRegular, AppGenericRegular, DismissRegular } from '@fluentui/react-icons';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
}

interface VersionMatch {
  field: string;
  value: string;
  versionIndex: number;
}

interface AppResult {
  appName: string;
  displayName: string;
  nameMatch: boolean;
  versionMatches: VersionMatch[];
}

interface GlobalSearchProps {
  apps: AppEntry[];
  onSelect: (appName: string) => void;
}

const VERSION_FIELDS: Array<{ key: keyof AppVersion; label: string }> = [
  { key: 'Version', label: 'Version' },
  { key: 'URI', label: 'URI' },
  { key: 'Language', label: 'Language' },
  { key: 'Architecture', label: 'Architecture' },
  { key: 'Type', label: 'Type' },
];

const MAX_APP_RESULTS = 8;
const MAX_VERSION_MATCHES = 2;

const HISTORY_KEY = 'searchHistory';
const MAX_HISTORY = 8;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

export default function GlobalSearch({ apps, onSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Open on Ctrl+K or /
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Focus input when opened; toggle body class for background blur
  useEffect(() => {
    if (open) {
      setInputValue('');
      setQuery('');
      setActiveIndex(0);
      setShowAll(false);
      setSearchHistory(loadHistory());
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.classList.add('search-open');
    } else {
      document.body.classList.remove('search-open');
    }
    return () => document.body.classList.remove('search-open');
  }, [open]);

  // Debounce: search computation lags 200ms behind typing
  useEffect(() => {
    const id = setTimeout(() => setQuery(inputValue), 200);
    return () => clearTimeout(id);
  }, [inputValue]);

  // Pre-compute lowercased names once per data load, not per keystroke
  const appsWithLower = useMemo(
    () => apps.map((a) => ({ ...a, lowerName: a.name.toLowerCase(), lowerDisplayName: a.displayName.toLowerCase() })),
    [apps]
  );

  const allResults = useMemo<AppResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const out: AppResult[] = [];

    for (const app of appsWithLower) {
      const nameMatch = app.lowerDisplayName.includes(q) || app.lowerName.includes(q);

      const versionMatches: VersionMatch[] = [];
      for (let i = 0; i < app.versions.length; i++) {
        if (versionMatches.length >= MAX_VERSION_MATCHES) break;
        const v = app.versions[i];
        for (const { key, label } of VERSION_FIELDS) {
          const val = String(v[key] ?? '');
          if (val && val.toLowerCase().includes(q)) {
            versionMatches.push({ field: label, value: val, versionIndex: i });
            break; // one match per version row
          }
        }
      }

      if (nameMatch || versionMatches.length > 0) {
        out.push({ appName: app.name, displayName: app.displayName, nameMatch, versionMatches });
      }
    }

    return out;
  }, [appsWithLower, query]);

  const results = useMemo(
    () => (showAll ? allResults : allResults.slice(0, MAX_APP_RESULTS)),
    [allResults, showAll]
  );
  const hiddenCount = allResults.length - results.length;

  // Flat list of selectable items for keyboard nav
  const flatItems: Array<{ appName: string }> = useMemo(
    () => results.map((r) => ({ appName: r.appName })),
    [results]
  );

  const handleSelect = useCallback((appName: string) => {
    const q = inputValue.trim();
    if (q) {
      const next = [q, ...searchHistory.filter((h) => h !== q)].slice(0, MAX_HISTORY);
      setSearchHistory(next);
      saveHistory(next);
    }
    setOpen(false);
    onSelect(appName);
  }, [inputValue, searchHistory, onSelect]);

  function applyHistoryQuery(q: string) {
    setInputValue(q);
  }

  function removeHistoryEntry(q: string, e: React.MouseEvent) {
    e.stopPropagation();
    const next = searchHistory.filter((h) => h !== q);
    setSearchHistory(next);
    saveHistory(next);
  }

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatItems[activeIndex]) handleSelect(flatItems[activeIndex].appName);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [flatItems, activeIndex, handleSelect]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Reset active index and showAll when results change
  useEffect(() => {
    setActiveIndex(0);
    setShowAll(false);
  }, [allResults]);

  function highlightMatch(text: string, q: string) {
    if (!q) return <>{text}</>;
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

  if (!open) {
    return (
      <button
        className="global-search-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open global search"
        title="Search (Ctrl+K)"
      >
        <SearchRegular aria-hidden="true" style={{ width: 15, height: 15 }} />
        <span className="global-search-trigger__label">Search</span>
        <kbd className="global-search-trigger__kbd">Ctrl K</kbd>
      </button>
    );
  }

  function handleOverlayKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) { e.preventDefault(); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  return createPortal(
    <div
      className="global-search-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      onKeyDown={handleOverlayKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className="global-search-modal" ref={modalRef}>
        <div className="global-search-input-row">
          <SearchRegular aria-hidden="true" className="global-search-icon" style={{ width: 16, height: 16 }} />
          <input
            ref={inputRef}
            className="global-search-input"
            type="text"
            placeholder="Search apps, versions, URLs…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-controls="global-search-results"
          />
          {inputValue && (
            <button className="global-search-clear" onClick={() => { setInputValue(''); setQuery(''); }} aria-label="Clear search">
              <DismissRegular aria-hidden="true" style={{ width: 14, height: 14 }} />
            </button>
          )}
          <kbd className="global-search-esc">Esc</kbd>
        </div>

        {inputValue.trim() === '' && searchHistory.length === 0 && (
          <div className="global-search-hint">
            Type to search across all apps and version data
          </div>
        )}

        {inputValue.trim() === '' && searchHistory.length > 0 && (
          <div className="global-search-history">
            <div className="global-search-history__header">Recent searches</div>
            <ul className="global-search-history__list">
              {searchHistory.map((h) => (
                <li key={h} className="global-search-history__item" onClick={() => applyHistoryQuery(h)}>
                  <HistoryRegular aria-hidden="true" style={{ width: 12, height: 12 }} />
                  <span className="global-search-history__text">{h}</span>
                  <button
                    className="global-search-history__remove"
                    onClick={(e) => removeHistoryEntry(h, e)}
                    aria-label={`Remove "${h}" from history`}
                  >
                    <DismissRegular aria-hidden="true" style={{ width: 12, height: 12 }} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {inputValue.trim() !== '' && results.length === 0 && (
          <div className="global-search-empty">
            No results for <strong>"{inputValue}"</strong>
          </div>
        )}

        {results.length > 0 && (
          <ul
            id="global-search-results"
            className="global-search-results"
            ref={listRef}
            role="listbox"
          >
            {results.map((result, idx) => (
              <li
                key={result.appName}
                data-index={idx}
                className={`global-search-result${activeIndex === idx ? ' global-search-result--active' : ''}`}
                role="option"
                aria-selected={activeIndex === idx}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleSelect(result.appName)}
              >
                <div className="global-search-result__name">
                  <AppGenericRegular aria-hidden="true" className="global-search-result__icon" style={{ width: 13, height: 13 }} />
                  {highlightMatch(result.displayName, query.trim())}
                </div>

                {result.versionMatches.length > 0 && (
                  <ul className="global-search-matches">
                    {result.versionMatches.map((m, mi) => (
                      <li key={mi} className="global-search-match">
                        <span className="global-search-match__field">{m.field}</span>
                        <span className="global-search-match__value">
                          {m.field === 'URI'
                            ? highlightMatch(
                                m.value.length > 60 ? '…' + m.value.slice(-57) : m.value,
                                query.trim()
                              )
                            : highlightMatch(m.value, query.trim())}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

        {hiddenCount > 0 && (
          <button className="global-search-show-more" onClick={() => setShowAll(true)}>
            Show {hiddenCount} more result{hiddenCount !== 1 ? 's' : ''}
          </button>
        )}

        {results.length > 0 && (
          <div className="global-search-footer">
            <span><kbd>↑↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>Esc</kbd> close</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
