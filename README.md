# Evergreen Workbench (web edition)

Evergreen Workbench is an Astro-based web application for exploring EUC pilot apps in a single, searchable interface. It provides a dashboard-style experience with app listings, detail views, sidebar navigation, and theme support, backed by local app data and reusable UI components.

This repository contains the web edition implementation, including Astro pages and layouts, React/TSX components, and global styling assets used to run the workbench in the browser.

## Apps navigation

Switching from Apps to Dashboard or About clears the app search and resets the Recent filter to All, including its saved value. Returning to Apps shows the full application list. Pinned apps and the dashboard's recent-update timeframe are unchanged.

## WinGet package references

The WinGet button in the app details header opens a flyout listing all mapped
WinGet package IDs for the same Evergreen app.
Copy an ID or a `winget show` command to inspect the package on Windows.
Use global search to find Evergreen apps by WinGet ID. Matches are references
only; Evergreen remains the source for versions and installer URLs.

The Pages build reads `winget/evergreen-winget.json` from the same
[AppTracker checkout](https://github.com/eucpilots/apptracker) as the catalog.
For local builds, place the optional mapping at `winget/evergreen-winget.json`
or point `JSON_GIT_DIR` at an AppTracker checkout. Missing or invalid mappings
produce a build warning but do not prevent Workbench from building.
If you use a local `public/appdata.json` snapshot, move it out of `public/`
before building from AppTracker data; Astro serves that file instead of the
generated catalog when both are present.

## Dashboard metrics

- **Update cadence:** Hover over or keyboard-focus a day in the 30-day chart to see its updated-app count, including days with no updates. Tooltip counts refresh when the dashboard receives new app data.
- **Hash coverage:** Percentage of download entries with a non-empty `Sha256`, `Sha1`, or `Hash` property (case-insensitive). Entries with multiple hash properties count once.
