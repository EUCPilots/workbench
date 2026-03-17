# Evergreen App Tracker — Astro Site Plan

## Overview

Static site tracking application versions returned by the [Evergreen](https://steveross.github.io/evergreen/) PowerShell module.
Deployed to GitHub Pages at `https://stealthpuppy.com/apptracker/`.

Previously built with Jekyll (Just the Docs). Migrated to **Astro + React** to support the interactive
two-panel SPA UI that matches the Evergreen Workbench desktop application.

---

## Architecture

```
json/                        ← App version data (one JSON per app, updated by update-apps.yml)
src/
  pages/
    index.astro              ← Shell page, mounts <AppsPage client:load />
    appdata.json.ts          ← Build-time API endpoint; reads json/*.json + git log for lastUpdated
  layouts/
    Layout.astro             ← HTML shell, Inter font, theme script
  components/
    AppsPage.tsx             ← Root SPA component; owns all state (tab, selectedApp, favourites)
    AppsSidebar.tsx          ← App list; favourites pinned at top; green dot badge for recent apps
    AppDetails.tsx           ← Version table; dynamic columns in JSON key order; copy-URI on row click
    DashboardPage.tsx        ← Stat cards + CSS bar charts (Architecture, File type top 10)
    AboutPage.tsx            ← Version info + changelog
    GlobalSearch.tsx         ← Ctrl+K overlay; searches all apps + version data; portal outside #root
    ThemeToggle.tsx          ← Light/dark toggle; persists to localStorage
  styles/
    global.css               ← Evergreen brand palette; CSS custom properties for light/dark
public/
  assets/                    ← Static images / icons
astro.config.mjs             ← base: '/apptracker', output: 'static'
package.json
tsconfig.json
.github/workflows/
  update-apps.yml            ← DO NOT EDIT. Runs Evergreen on windows-latest; commits json/*.json
  astro-gh-pages.yml         ← Builds + deploys Astro site to GitHub Pages
```

---

## Data Flow

```
update-apps.yml (windows-latest)
  └─ scripts/Update-Json.ps1
       └─ Saves one JSON file per app to json/
       └─ Commits to main with message "Update json YYYY.MM.DD..."

  ↓  workflow_run trigger (on: completed, conclusion == success)

astro-gh-pages.yml (ubuntu-latest)
  └─ actions/checkout@v4  (fetch-depth: 0 — full history for git log)
  └─ npm ci
  └─ npm run build
       └─ src/pages/appdata.json.ts runs at build time:
            • Globs json/*.json → versions[]
            • Runs `git log -1 --format=%cI -- json/<app>.json` per app → lastUpdated
            • Outputs dist/appdata.json  { meta, apps[] }
  └─ upload-pages-artifact (dist/)
  └─ deploy-pages → https://stealthpuppy.com/apptracker/
```

Also triggers on:
- Direct push to `main` touching `src/**`, `public/**`, `astro.config.mjs`, `package.json`
- Manual `workflow_dispatch`

---

## Moving to a New Repository

When the Astro site is extracted to its own repository, the following needs updating:

### Files to copy
```
src/
public/
json/                        ← Copy current snapshot; kept live by update-apps.yml commits
astro.config.mjs
package.json
tsconfig.json
.gitignore                   ← Ensure dist/, .astro/, node_modules/ are excluded
.github/workflows/
  astro-gh-pages.yml         ← Update workflow_run reference (see below)
```

### Files NOT needed in new repo
```
docs/                        ← Old Jekyll site, no longer used
scripts/New-Report.ps1       ← Jekyll report generator, no longer used
.github/workflows/update-docs.yml   ← Jekyll workflow, replaced by astro-gh-pages.yml
.github/workflows/update-apps.yml  ← Stays in original repo (or move if json/ moves)
```

### Cross-repo data strategy

**Option B — json/ stays in original repo, fetched at build time**
Keep `update-apps.yml` and `json/` in the original repo unchanged.
In the new repo's `astro-gh-pages.yml`, add a step to clone only the `json/` folder
from the original repo before building:

```yaml
- name: Fetch app JSON data
  run: |
    git clone --depth=1 --filter=blob:none --sparse \
      https://github.com/stealthpuppy/apptracker.git _source
    cd _source && git sparse-checkout set json
    cp -r _source/json ./json
```

Note: `fetch-depth: 0` on the main checkout is still needed for `git log` date
resolution to work correctly in `appdata.json.ts`.

---

## Features Implemented

| Feature | Component |
|---------|-----------|
| Two-panel SPA (sidebar + detail) | `AppsPage.tsx` |
| Light/dark theme (Evergreen brand palette) | `global.css`, `ThemeToggle.tsx` |
| Favourites / pinned apps with star button | `AppsSidebar.tsx`, `AppsPage.tsx` |
| Green dot badge for apps updated within 48 h | `AppsSidebar.tsx` |
| Sortable + per-column searchable version table | `AppDetails.tsx` |
| Dynamic columns in JSON key order | `AppDetails.tsx` |
| Copy URI on row click with flash animation | `AppDetails.tsx` |
| PowerShell `Get-EvergreenApp` snippet per app | `AppDetails.tsx` |
| Global search overlay (Ctrl+K) with blur | `GlobalSearch.tsx` |
| Search by URI/URL in global search | `GlobalSearch.tsx` |
| Architecture + File type filters | `AppDetails.tsx` |
| Dashboard with stat cards + CSS bar charts | `DashboardPage.tsx` |
| About page with changelog | `AboutPage.tsx` |
| Hash-based permalink routing (`#AppName`) | `AppsPage.tsx` |
| Keyboard navigation (↑↓ arrow, / for search) | `AppsPage.tsx` |
| Persist selected app + theme to localStorage | `AppsPage.tsx` |
| Build-time `lastUpdated` via `git log` | `src/pages/appdata.json.ts` |
| GitHub Pages deploy workflow | `.github/workflows/astro-gh-pages.yml` |

---

## Outstanding / Future Work

- [ ] Cross-repo data strategy decision (Option A vs B above)
- [ ] Set up GitHub Pages in new repository
- [ ] Validate `workflow_dispatch` triggers on new repo before going live
- [ ] Commit all current changes and open PR from `astro` → `main`
- [ ] After merge: confirm `workflow_run` chain fires end-to-end
- [ ] Consider adding `package-lock.json` to version control (currently gitignored)

---

## Local Development

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:4321/apptracker/
npm run build    # production build → dist/
npm run preview  # preview dist/ locally
```

Build requires full git history for `lastUpdated` resolution:
```bash
git fetch --unshallow   # if cloned with --depth
```

---

## Key Design Decisions

**Why Astro?**
Static output compatible with GitHub Pages. Build-time data loading (no runtime API calls).
React islands for interactivity without a full SPA framework.

**Why no charting library?**
CSS `width` percentages on `.bar-chart__bar` elements are sufficient for the simple
horizontal bar charts on the Dashboard. Zero JS bundle cost.

**Why React Portal for GlobalSearch?**
The search overlay needs to render outside `#root` so a `filter: blur(4px)` on `#root`
blurs the background without blurring the overlay itself.

**Why `git log` for lastUpdated?**
The JSON files don't contain a last-updated timestamp. The git commit date of the most
recent change to each `json/<app>.json` file is the canonical source of truth for when
Evergreen last saw a new version.
