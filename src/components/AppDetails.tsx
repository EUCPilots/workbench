import { useState, useMemo, useRef, useEffect } from 'react';

interface AppVersion {
  Version?: string;
  Type?: string;
  Architecture?: string;
  Language?: string;
  URI?: string;
  Size?: number | string;
  [key: string]: unknown;
}

interface AppDetailsProps {
  appName: string;
  displayName: string;
  versions: AppVersion[];
  lastUpdated: string | null;
  onBack?: () => void;
  base: string;
}

function getFileType(v: AppVersion): string {
  if (v.Type && typeof v.Type === 'string' && v.Type.trim()) return v.Type.trim();
  if (v.URI) {
    const ext = v.URI.split('?')[0].split('.').pop();
    if (ext) return ext.toLowerCase();
  }
  return 'unknown';
}

function exportToCSV(rows: AppVersion[], filename: string) {
  const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const header = allKeys.join(',');
  const body = rows
    .map((r) =>
      allKeys
        .map((k) => {
          const val = r[k] ?? '';
          const str = String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(',')
    )
    .join('\n');
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return null;
  }
}

function loadSavedFilters(name: string): { archs: Set<string>; types: Set<string> } | null {
  try {
    const raw = localStorage.getItem(`columnFilters__${name}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { archs: new Set(parsed.archs), types: new Set(parsed.types) };
  } catch {
    return null;
  }
}

function saveFilters(name: string, archs: Set<string>, types: Set<string>) {
  try {
    localStorage.setItem(`columnFilters__${name}`, JSON.stringify({
      archs: Array.from(archs),
      types: Array.from(types),
    }));
  } catch { /* ignore */ }
}

function loadHiddenColumns(name: string): Set<string> {
  try {
    const raw = localStorage.getItem(`hiddenColumns__${name}`);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveHiddenColumns(name: string, hidden: Set<string>) {
  try {
    localStorage.setItem(`hiddenColumns__${name}`, JSON.stringify(Array.from(hidden)));
  } catch { /* ignore */ }
}

export default function AppDetails({ appName, displayName, versions, lastUpdated, onBack, base }: AppDetailsProps) {
  const feedUrl = `${base}feeds/${appName}.xml`;
  // Derive unique filter values from data
  const architectures = useMemo(() => {
    const set = new Set<string>();
    versions.forEach((v) => {
      if (v.Architecture) set.add(v.Architecture);
    });
    return Array.from(set).sort();
  }, [versions]);

  const fileTypes = useMemo(() => {
    const set = new Set<string>();
    versions.forEach((v) => set.add(getFileType(v)));
    return Array.from(set).sort();
  }, [versions]);

  function initArchitectures(name: string, archs: string[]): Set<string> {
    const saved = loadSavedFilters(name);
    if (saved) return new Set(archs.filter((a) => saved.archs.has(a)));
    return new Set(archs);
  }

  function initFileTypes(name: string, types: string[]): Set<string> {
    const saved = loadSavedFilters(name);
    if (saved) return new Set(types.filter((t) => saved.types.has(t)));
    return new Set(types);
  }

  const [selectedArchitectures, setSelectedArchitectures] = useState<Set<string>>(
    () => initArchitectures(appName, architectures)
  );
  const [selectedFileTypes, setSelectedFileTypes] = useState<Set<string>>(
    () => initFileTypes(appName, fileTypes)
  );

  // Reset filters when app changes
  const [lastApp, setLastApp] = useState(appName);
  if (lastApp !== appName) {
    setLastApp(appName);
    setSelectedArchitectures(initArchitectures(appName, architectures));
    setSelectedFileTypes(initFileTypes(appName, fileTypes));
    setHiddenColumns(loadHiddenColumns(appName));
    setColumnSearch({});
  }

  const filteredVersions = useMemo(() => {
    return versions.filter((v) => {
      const arch = v.Architecture ?? '';
      const ft = getFileType(v);
      const archMatch = architectures.length === 0 || selectedArchitectures.has(arch) || (!arch && selectedArchitectures.size === 0);
      const ftMatch = fileTypes.length === 0 || selectedFileTypes.has(ft);
      return archMatch && ftMatch;
    });
  }, [versions, selectedArchitectures, selectedFileTypes, architectures, fileTypes]);

  function toggleArch(arch: string) {
    setSelectedArchitectures((prev) => {
      const next = new Set(prev);
      if (next.has(arch)) next.delete(arch);
      else next.add(arch);
      saveFilters(appName, next, selectedFileTypes);
      return next;
    });
  }

  function toggleFileType(ft: string) {
    setSelectedFileTypes((prev) => {
      const next = new Set(prev);
      if (next.has(ft)) next.delete(ft);
      else next.add(ft);
      saveFilters(appName, selectedArchitectures, next);
      return next;
    });
  }

  function clearFilters() {
    const archs = new Set(architectures);
    const types = new Set(fileTypes);
    setSelectedArchitectures(archs);
    setSelectedFileTypes(types);
    saveFilters(appName, archs, types);
  }

  // Determine which columns to show based on the data.
  // Priority columns appear first in a fixed order; any additional keys found
  // in the data are appended alphabetically after them.
  const columns = useMemo(() => {
    // Preserve the natural key order as found in the JSON data (first-seen wins)
    const ordered: string[] = [];
    const seen = new Set<string>();
    versions.forEach((v) =>
      Object.keys(v).forEach((k) => {
        if (!seen.has(k)) { seen.add(k); ordered.push(k); }
      })
    );
    return ordered;
  }, [versions]);

  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(() => loadHiddenColumns(appName));
  const [colPickerOpen, setColPickerOpen] = useState(false);
  const colPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colPickerOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (colPickerRef.current && !colPickerRef.current.contains(e.target as Node)) {
        setColPickerOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [colPickerOpen]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c)),
    [columns, hiddenColumns]
  );

  function toggleColumn(col: string) {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      saveHiddenColumns(appName, next);
      return next;
    });
  }

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});
  const [copiedRow, setCopiedRow] = useState<number | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Reset column search when app changes
  if (lastApp !== appName) {
    // (lastApp/appName sync already handled above)
    // columnSearch reset handled via the key approach below
  }

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  function handleColumnSearch(col: string, value: string) {
    setColumnSearch((prev) => ({ ...prev, [col]: value }));
  }

  function clearAllSearch() {
    setColumnSearch({});
  }

  const columnFilteredVersions = useMemo(() => {
    return filteredVersions.filter((v) =>
      columns.every((col) => {
        const term = (columnSearch[col] ?? '').trim().toLowerCase();
        if (!term) return true;
        const cellVal = v[col] != null ? String(v[col]) : '';
        return cellVal.toLowerCase().includes(term);
      })
    );
  }, [filteredVersions, columnSearch, columns]);

  const hasColumnSearch = useMemo(
    () => Object.values(columnSearch).some((v) => v.trim() !== ''),
    [columnSearch]
  );

  const sortedVersions = useMemo(() => {
    if (!sortCol) return columnFilteredVersions;
    return [...columnFilteredVersions].sort((a, b) => {
      const av = String(a[sortCol] ?? '');
      const bv = String(b[sortCol] ?? '');
      // Numeric sort for Version and Size columns
      const an = parseFloat(av);
      const bn = parseFloat(bv);
      let cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [columnFilteredVersions, sortCol, sortDir]);

  function showCopyError() {
    setCopyError(true);
    setTimeout(() => setCopyError(false), 2500);
  }

  function copyEvergreenCommand() {
    const cmd = `Get-EvergreenApp -Name ${appName}`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 1500);
    }).catch(showCopyError);
  }

  function copyRowUri(uri: string, rowIndex: number) {
    navigator.clipboard.writeText(uri).then(() => {
      setCopiedRow(rowIndex);
      setTimeout(() => setCopiedRow(null), 1500);
    }).catch(showCopyError);
  }

  return (
    <div className="details-panel">
      <div className="details-panel__header">
        {onBack && (
          <button className="back-btn" onClick={onBack} aria-label="Back to app list">
            &#8592;
          </button>
        )}
        <span className="details-panel__title">{displayName}</span>
        <button
          className={`ps-copy-btn${copiedCmd ? ' ps-copy-btn--copied' : ''}`}
          onClick={copyEvergreenCommand}
          title={`Copy: Get-EvergreenApp -Name ${appName}`}
          aria-label="Copy Evergreen PowerShell command"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ps-copy-btn__icon">
            <rect x="5" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M2 4.5H2A1.5 1.5 0 0 0 .5 6v8A1.5 1.5 0 0 0 2 15.5h6A1.5 1.5 0 0 0 9.5 14v-.5" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          <code className="ps-copy-btn__label">
            {copiedCmd ? 'Copied!' : `Get-EvergreenApp -Name ${appName}`}
          </code>
        </button>
        <a
          className="feed-subscribe-btn"
          href={feedUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`RSS feed for ${displayName}`}
          aria-label={`RSS feed for ${displayName}`}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="2.5" cy="13.5" r="1.5" />
            <path d="M1 9.5a6 6 0 0 1 5.5 5.5H8a7.5 7.5 0 0 0-7-7v1.5z" />
            <path d="M1 5.5a10 10 0 0 1 9.5 9.5H12A11.5 11.5 0 0 0 1 4v1.5z" />
          </svg>
          <span className="feed-subscribe-btn__label">RSS</span>
        </a>
        {formatDate(lastUpdated) && (
          <span className="details-panel__updated">Updated {formatDate(lastUpdated)}</span>
        )}
      </div>

      <div className="details-panel__body">
        {/* Filters */}
        <div className="filter-section">
          {architectures.length > 0 && (
            <div className="filter-group">
              <span className="filter-group__label">Architecture</span>
              <div className="filter-group__options">
                {architectures.map((arch) => (
                  <label className="checkbox-label" key={arch}>
                    <input
                      type="checkbox"
                      checked={selectedArchitectures.has(arch)}
                      onChange={() => toggleArch(arch)}
                    />
                    {arch}
                  </label>
                ))}
              </div>
            </div>
          )}

          {fileTypes.length > 0 && (
            <div className="filter-group">
              <span className="filter-group__label">Type</span>
              <div className="filter-group__options">
                {fileTypes.map((ft) => (
                  <label className="checkbox-label" key={ft}>
                    <input
                      type="checkbox"
                      checked={selectedFileTypes.has(ft)}
                      onChange={() => toggleFileType(ft)}
                    />
                    {ft}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Copy error notice */}
        {copyError && (
          <div className="copy-error-notice" role="alert">
            Copy failed — select the text manually to copy.
          </div>
        )}

        {/* Results bar */}
        <div className="results-bar">
          <span className="results-bar__count">
            Showing {sortedVersions.length} of {versions.length}
          </span>
          <div className="results-bar__actions">
            {hasColumnSearch && (
              <button className="btn btn-outline" onClick={clearAllSearch}>
                Clear search
              </button>
            )}
            <button className="btn btn-outline" onClick={clearFilters}>
              Clear filters
            </button>
            <div className="col-picker" ref={colPickerRef}>
              <button
                className="btn btn-outline"
                onClick={() => setColPickerOpen((o) => !o)}
                aria-expanded={colPickerOpen}
                aria-haspopup="listbox"
              >
                Columns{hiddenColumns.size > 0 ? ` (${hiddenColumns.size} hidden)` : ''}
              </button>
              {colPickerOpen && (
                <div className="col-picker__dropdown" role="listbox" aria-label="Toggle column visibility">
                  {columns.map((col) => (
                    <label key={col} className="col-picker__item">
                      <input
                        type="checkbox"
                        checked={!hiddenColumns.has(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      {col}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn btn-outline"
              onClick={() => exportToCSV(sortedVersions, appName)}
            >
              Export to CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="version-table">
            <thead>
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col}
                    aria-sort={sortCol === col ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      className="th-sort-btn"
                      onClick={() => handleSort(col)}
                      title={`Sort by ${col}`}
                    >
                      <span>{col}</span>
                      <span className="sort-icon">
                        {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '⬍'}
                      </span>
                    </button>
                    <input
                      className="th-search-input"
                      type="text"
                      placeholder={`Filter…`}
                      value={columnSearch[col] ?? ''}
                      onChange={(e) => handleColumnSearch(col, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Search ${col}`}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedVersions.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No results match the current filters.
                  </td>
                </tr>
              ) : (
                sortedVersions.map((v, i) => {
                  // Find the first URL value in this row for row-click copy
                  const rowUri = columns
                    .map((col) => v[col])
                    .find((val): val is string => typeof val === 'string' && /^https?:\/\//i.test(val));
                  const isCopied = copiedRow === i;
                  return (
                    <tr
                      key={i}
                      className={[
                        rowUri ? 'version-table__row--has-uri' : '',
                        isCopied ? 'version-table__row--copied' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={rowUri ? () => copyRowUri(rowUri, i) : undefined}
                      title={rowUri ? (isCopied ? 'Copied!' : 'Click to copy URI') : undefined}
                    >
                      {visibleColumns.map((col) => {
                        const raw = v[col];
                        const strVal = raw != null ? String(raw) : '';
                        const isUrl = typeof raw === 'string' && /^https?:\/\//i.test(raw);
                        return (
                          <td key={col} className={isUrl ? 'uri-cell' : ''} title={isUrl && !isCopied ? strVal : undefined}>
                            {isUrl && isCopied ? (
                              <span className="uri-copy-badge">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                  <path d="M2.5 8.5l3.5 3.5 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Copied
                              </span>
                            ) : isUrl ? (
                              <a
                                href={strVal}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {strVal}
                              </a>
                            ) : (
                              strVal
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
